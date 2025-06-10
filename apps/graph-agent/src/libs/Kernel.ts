import HttpProvider from './providers/HttpProvider';
import LocalCronProvider from './providers/LocalCronProvider';
import MongodbProvider from './providers/MongodbProvider';

export class Kernel {
  //provider register
  public static providers = [MongodbProvider, HttpProvider, LocalCronProvider];
  //job register
  public static jobs = [];
}
