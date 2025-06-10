import { env } from '.';

export class ServerType {
  static getServerTypes() {
    return env.serverType.replace(/ /g, '').split(',');
  }

  static allowProducerServer() {
    return ServerType.getServerTypes().includes('producer');
  }

  static allowWorkerServer() {
    return ServerType.getServerTypes().includes('worker');
  }

  static allowCronServer() {
    return ServerType.getServerTypes().includes('cron');
  }

  static allowBot() {
    return ServerType.getServerTypes().includes('bot');
  }

  static allowGameServer() {
    return ServerType.getServerTypes().includes('gameserver');
  }
}
