use std::collections::BTreeMap;
use std::time::Duration;

use anyhow::anyhow;
use backoff::backoff::Backoff;
use move_core_types::language_storage::StructTag;
use napi::{bindgen_prelude::BigInt, Error as NapiError, Status};
use napi_derive::napi;

use move_core_types::annotated_value::MoveTypeLayout;
use serde::{Deserialize, Serialize};
use serde_json;

use futures::future;
use move_core_types::annotated_value::MoveValue;
use sui_json_rpc_types::type_and_fields_from_move_event_data;
use sui_json_rpc_types::{SuiData, SuiParsedData};
use sui_storage::blob::Blob;
use sui_types::digests::TransactionDigest;
use sui_types::effects::{TransactionEffectsAPI, TransactionEvents};
use sui_types::full_checkpoint_content::CheckpointData;
use sui_types::messages_checkpoint::CertifiedCheckpointSummary;
use sui_types::object::Object;

use sui_types::storage::ObjectKey;
use sui_types::TypeTag;
use tracing::debug;

mod helpers;
use helpers::package_resolver::{self, PackageResolver};

const MAX_RESULT_LIMIT: usize = 50;

#[derive(Eq, PartialEq, Debug, Clone, Deserialize, Serialize, Hash)]
pub struct FullObjectData {
  object_key: ObjectKey,
  object: Object,
  serialized_object: Vec<u8>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CheckpointTransaction {
  /// The input Transaction
  pub transaction_digest: TransactionDigest,
  pub events: Option<TransactionEvents>,
  // pub created_objects: Vec<ObjectKey>,
  // pub mutated_objects: Vec<ObjectKey>,
  // pub deleted_objects: Vec<ObjectKey>,
  pub output_objects: Vec<FullObjectData>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FullCheckpointData {
  pub checkpoint_summary: CertifiedCheckpointSummary,
  pub transactions: Vec<CheckpointTransaction>,
}

#[napi(object)]
pub struct ObjectData {
  pub contents: String,
  pub display: Option<BTreeMap<String, String>>,
}

#[napi(object)]
pub struct ObjectResponseError {
  pub reason: String,
}

#[napi(object)]
pub struct ObjectResponse {
  pub data: Option<String>,
  pub error: Option<ObjectResponseError>,
}

#[napi(object)]
pub struct CheckpointResponse {
  pub data: String,
  pub size: BigInt,
}

#[napi(object)]
pub struct ReaderOptions {
  pub remote_store_base_uri: String,
}

impl ReaderOptions {
  pub fn new(remote_store_base_uri: String) -> Self {
    ReaderOptions {
      remote_store_base_uri,
    }
  }
}

#[napi(object)]
pub struct ParseObjectParams {
  pub object_bytes: Vec<u8>,
}

impl ParseObjectParams {
  pub fn new(object_bytes: Vec<u8>) -> Self {
    ParseObjectParams { object_bytes }
  }
}

#[napi(object)]
pub struct MultiParseObjectsParams {
  pub objects: Vec<ParseObjectParams>,
}

#[napi]
pub struct SuiCheckpointReader {
  remote_store_base_uri: String,
  http_client: reqwest::Client,
  package_resolver: PackageResolver,
}

#[napi]
impl SuiCheckpointReader {
  #[napi]
  pub async fn new_with_config(options: ReaderOptions) -> Result<Self, NapiError> {
    let package_resolver = package_resolver::create_package_resolver();

    let remote_store_base_uri = options
      .remote_store_base_uri
      .as_str()
      .trim_end_matches('/')
      .to_string();
    Ok(SuiCheckpointReader {
      remote_store_base_uri,
      http_client: reqwest::Client::new(),
      package_resolver,
    })
  }

  #[napi]
  pub async fn fetch_checkpoint(
    &self,
    checkpoint_number: BigInt,
  ) -> Result<CheckpointResponse, NapiError> {
    let mut backoff = backoff::ExponentialBackoff::default();
    backoff.max_elapsed_time = Some(Duration::from_secs(60));
    backoff.initial_interval = Duration::from_millis(100);
    backoff.current_interval = backoff.initial_interval;
    backoff.multiplier = 1.0;
    loop {
      match self
        .fetch_checkpoint_internal(checkpoint_number.get_u64().1)
        .await
      {
        Ok(data) => return Ok(data),
        Err(err) => match backoff.next_backoff() {
          Some(duration) => {
            if !err.to_string().contains("404") {
              debug!(
                "fetch checkpoint retry in {} ms. Error is {:?}",
                duration.as_millis(),
                err
              );
            }
            tokio::time::sleep(duration).await
          }
          None => {
            return Err(NapiError::new(
              Status::GenericFailure,
              format!("fetch checkpoint failed: {}", err),
            ))
          }
        },
      }
    }
  }

  #[napi]
  pub async fn parse_object(&self, params: ParseObjectParams) -> Result<ObjectResponse, NapiError> {
    match self
      .parse_object_internal(params.object_bytes.as_slice())
      .await
      .map_err(|e| NapiError::new(Status::GenericFailure, e))
    {
      Ok(object_data) => Ok(ObjectResponse {
        data: Some(object_data),
        error: None,
      }),
      Err(e) => Ok(ObjectResponse {
        data: None,
        error: Some(ObjectResponseError { reason: e.reason }),
      }),
    }
  }

  #[napi]
  pub async fn parse_event_contents(
    &self,
    type_: String,
    contents: Vec<u8>,
  ) -> Result<ObjectResponse, NapiError> {
    let new_type: StructTag =
      serde_json::from_str(&type_).expect("type_ StringJSON was not well-formatted");

    match self
      .parse_event_contents_internal(new_type, contents.as_slice())
      .await
      .map_err(|e| NapiError::new(Status::GenericFailure, e))
    {
      Ok(object_data) => Ok(ObjectResponse {
        data: Some(object_data),
        error: None,
      }),
      Err(e) => Ok(ObjectResponse {
        data: None,
        error: Some(ObjectResponseError { reason: e.reason }),
      }),
    }
  }

  #[napi]
  pub async fn multi_parse_objects(
    &self,
    params: MultiParseObjectsParams,
  ) -> Result<Vec<ObjectResponse>, NapiError> {
    if params.objects.len() > MAX_RESULT_LIMIT {
      return Err(NapiError::new(
        Status::GenericFailure,
        "Size limit exceeded",
      ));
    }

    let futures = params
      .objects
      .into_iter()
      .map(|object| async { self.parse_object(object).await });

    future::try_join_all(futures).await
  }

  async fn fetch_checkpoint_internal(
    &self,
    checkpoint_number: u64,
  ) -> anyhow::Result<CheckpointResponse> {
    let path = format!("{}/{}.chk", self.remote_store_base_uri, checkpoint_number);
    let resp = self.http_client.get(&path).send().await?;

    let bytes_data = resp.bytes().await?;

    let checkpoint_data: CheckpointData =
      Blob::from_bytes::<CheckpointData>(&bytes_data).map_err(|e| {
        NapiError::new(
          Status::GenericFailure,
          format!("Failed to parse blob: {}", e),
        )
      })?;

    let full_checkpoint_data = FullCheckpointData {
      checkpoint_summary: checkpoint_data.checkpoint_summary.clone(),
      transactions: checkpoint_data
        .transactions
        .iter()
        .map(|txn| {
          let output_object_keys = txn
            .effects
            .all_changed_objects()
            .into_iter()
            .map(|(object_ref, _owner, _kind)| ObjectKey::from(object_ref))
            .collect::<Vec<_>>();

          return CheckpointTransaction {
            transaction_digest: txn.effects.transaction_digest().clone(),
            events: txn.events.clone(),
            // created_objects: txn
            //   .effects
            //   .created()
            //   .iter()
            //   .map(|(object_ref, _)| ObjectKey::from(object_ref))
            //   .collect(),
            // mutated_objects: txn
            //   .effects
            //   .mutated()
            //   .iter()
            //   .map(|(object_ref, _)| ObjectKey::from(object_ref))
            //   .collect(),
            // deleted_objects: txn
            //   .effects
            //   .deleted()
            //   .iter()
            //   .map(|object_ref| ObjectKey::from(object_ref))
            //   .collect(),
            output_objects: txn
              .output_objects
              .iter()
              .enumerate()
              .map(|(idx, o)| FullObjectData {
                object_key: output_object_keys[idx],
                object: o.clone(),
                serialized_object: bcs::to_bytes(o).unwrap(),
              })
              .collect(),
          };
        })
        .collect(),
    };

    Ok(CheckpointResponse {
      data: serde_json::to_string(&full_checkpoint_data).unwrap(),
      size: (BigInt::from(bytes_data.len() as u64)),
    })
  }

  async fn parse_object_internal(&self, object_bytes: &[u8]) -> Result<String, anyhow::Error> {
    let object = bcs::from_bytes::<Object>(&object_bytes)
      .map_err(|e| anyhow!(format!("Failed to parse object: {}", e)))?;

    let move_object = match object.data.try_as_move().cloned() {
      Some(move_object) => move_object,
      None => {
        return Err(anyhow!("Object is not a MoveObject".to_string(),));
      }
    };

    let struct_tag: StructTag = move_object.type_().clone().into();
    let move_type_layout = self
      .package_resolver
      .type_layout(TypeTag::Struct(Box::new(struct_tag.clone())))
      .await
      .map_err(|e| {
        anyhow!(format!(
          "Failed to convert into object read for obj {}:{}, type: {}. Error: {e}",
          object.id(),
          object.version().value(),
          move_object.type_(),
        ))
      })?;

    let MoveTypeLayout::Struct(move_struct_layout) = move_type_layout else {
      return Err(anyhow!("MoveTypeLayout is not Struct".to_string()));
    };

    let parsed_object_data = SuiParsedData::try_from_object(move_object, *move_struct_layout)?;

    Ok(serde_json::to_string(&parsed_object_data)?)
  }

  async fn parse_event_contents_internal(
    &self,
    type_: StructTag,
    contents: &[u8],
  ) -> Result<String, anyhow::Error> {
    let layout = self
      .package_resolver
      .type_layout(move_core_types::language_storage::TypeTag::Struct(
        Box::new(type_.clone()),
      ))
      .await
      .map_err(|e| anyhow!(format!("Parse_event_contents failuer: {e}",)))?;

    let move_value = MoveValue::simple_deserialize(contents, &layout)?;

    let (_, event_json) = type_and_fields_from_move_event_data(move_value)?;

    Ok(serde_json::to_string(&event_json)?)
  }
}
