import { SuiClient } from '@mysten/sui/client';
import { normalizeSuiObjectId, parseStructTag } from '@mysten/sui/utils';
import * as fs from 'fs';
import { internal } from './helpers/axios';
import { getSubgraphConfig } from './helpers/getSubgraphConfig';
import { executePromise } from './utils/executePromise';

export class InitialEssentialPackages {
  constructor(
    private readonly suiClient: SuiClient,
    private readonly config: {
      beUrl: string;
      systemAccessToken: string;
      subgraphConfigPath: string;
      essentialPackagesDestinationPath: string;
    },
  ) {}

  async handleInitialEssentialPackages() {
    const subgraphConfig = getSubgraphConfig(this.config.subgraphConfigPath);
    const types = subgraphConfig.mappings.map(item => item.type);

    let packageIds: string[] = [];

    for (const type of types) {
      const { address, module, name } = parseStructTag(type);
      const result = await this.getEssentialPackageIds(address, module, name);

      packageIds = packageIds.concat(result);
    }

    const [error, res] = await executePromise(
      internal({
        method: 'GET',
        url: `${this.config.beUrl}/package`,
        params: {
          ids: packageIds,
        },
        headers: {
          Authorization: `Bearer ${this.config.systemAccessToken}`,
        },
      }),
    );

    if (error) {
      throw new Error(`Failed to get essential packages: ${error.message}`);
    }

    if (res.status !== 200) {
      throw new Error(`Failed to get essential packages`);
    }

    fs.writeFileSync(this.config.essentialPackagesDestinationPath, JSON.stringify(res.data));
  }

  private async getEssentialPackageIds(packageAddress: string, module: string, structName: string) {
    const packageIds: string[] = [];

    if (!packageIds.find(packageId => packageId === packageAddress)) {
      packageIds.push(packageAddress);
    }

    const normalizedMoveStruct = await this.suiClient.getNormalizedMoveStruct({
      package: packageAddress,
      module,
      struct: structName,
    });

    const fields = normalizedMoveStruct.fields;

    for (const field of fields) {
      let Struct = field.type['Struct'];
      const Vector = field.type['Vector'];

      if (Vector) {
        Struct = Vector.Struct;
      }

      if (!Struct) {
        continue;
      }

      if (!packageIds.find(packageId => packageId === Struct.address)) {
        packageIds.push(Struct.address);
      }

      await this.getEssentialPackageIds(Struct.address, Struct.module, Struct.name);
    }

    return packageIds.map(packageId => normalizeSuiObjectId(packageId));
  }
}
