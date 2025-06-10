import HttpProvider from './providers/HttpProvider';
import MongodbProvider from './providers/MongodbProvider';

export class Kernel {
  //provider register
  public static providers = [
    // BootstrapProvider,
    // MongodbProvider,
    // CacheProvider,
    MongodbProvider,
    HttpProvider,
    // GraphqlProvider,
    // JobsProvider,
    // CronProvider,
  ];
  //job register
  public static jobs = [];
}
