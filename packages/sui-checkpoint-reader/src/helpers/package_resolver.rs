use std::{collections::HashMap, fs::File, io::Read, sync::Arc};

use anyhow::anyhow;
use async_trait::async_trait;

use move_core_types::account_address::AccountAddress;
use serde::{Deserialize, Serialize};
use sui_package_resolver::{
  error::Error as PackageResolverError, Package, PackageStore, PackageStoreWithLruCache, Resolver,
};
use sui_types::object::Object;

#[derive(Serialize, Deserialize, Debug)]
pub struct StoredPackage {
  pub package_id: String,
  pub serialized_object: Vec<u8>,
}

type PackageMap = HashMap<String, StoredPackage>;

pub type PackageResolver = Arc<Resolver<PackageStoreWithLruCache<IndexerStorePackageResolver>>>;

pub struct IndexerStorePackageResolver {
  packages: PackageMap,
}

impl IndexerStorePackageResolver {
  pub fn new() -> Self {
    let mut file = File::open("essentialPackages.json").expect("Cant not open file");
    let mut contents = String::new();

    file
      .read_to_string(&mut contents)
      .expect("Can not read file");

    let packages: PackageMap =
      serde_json::from_str(&contents).expect("JSON was not well-formatted");

    Self { packages }
  }
}

#[async_trait]
impl PackageStore for IndexerStorePackageResolver {
  async fn fetch(&self, id: AccountAddress) -> Result<Arc<Package>, PackageResolverError> {
    let pkg = self
      .get_package(id)
      .map_err(|e| PackageResolverError::Store {
        store: "JSON_FILE",
        error: e.to_string(),
      })?;

    Ok(Arc::new(pkg))
  }
}

impl IndexerStorePackageResolver {
  fn get_package(&self, id: AccountAddress) -> Result<Package, anyhow::Error> {
    let package_id = id.to_canonical_string(true);

    let Some(pkg) = self.packages.get(&package_id) else {
      return Err(anyhow!("Package {} not found", package_id));
    };

    let pkg_object = bcs::from_bytes::<Object>(&pkg.serialized_object.as_slice())
      .map_err(|e| anyhow!(format!("Failed to parse package {} : {}", package_id, e)))?;

    Package::read_from_object(&pkg_object)
      .map_err(|e| anyhow!("Failed parsing object to package: {e}"))
  }
}

pub fn create_package_resolver() -> PackageResolver {
  let indexer_store_pkg_resolver = IndexerStorePackageResolver::new();
  let package_cache = PackageStoreWithLruCache::new(indexer_store_pkg_resolver);
  Arc::new(Resolver::new(package_cache))
}
