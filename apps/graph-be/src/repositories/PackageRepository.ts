import { Service } from 'typedi';
import { env } from '../libs/env';
const { MongoClient } = require('mongodb');
const client = new MongoClient(env.mongodb.packageUri);

@Service()
export class PackageRepository {
  async getPackageByIds(ids: string[]): Promise<Record<string, any>> {
    try {
      await client.connect();
      const db = client.db(env.mongodb.packageDbName);
      const packageCollection = db.collection('packages');
      const essentialPackages = await packageCollection
        .find({ package_id: { $in: ids } })
        .project({ _id: 0 })
        .toArray();
      const essentialPackagesObject: Record<string, any> = {};

      essentialPackages.forEach(essentialPackage => {
        essentialPackagesObject[essentialPackage.package_id] = essentialPackage;
      });

      return essentialPackagesObject;
    } catch (error) {
      console.error('PackageRepository', error);
      return {};
    } finally {
      await client.close();
    }
  }
}
