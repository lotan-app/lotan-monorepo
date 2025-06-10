import { Service } from 'typedi';

import { AgentService } from 'src/services/AgentService';
import { EdgeService } from 'src/services/EdgeService';
import { Logger } from '../../decorators/Logger';
import { ILogger } from '../types/ILogger';
import Provider from './Provider';
import { delay } from '../utils/delay';

@Service()
export default class LocalCronProvider extends Provider {
  constructor(
    @Logger(module.filename) private logger: ILogger,
    private readonly agentService: AgentService,
    private readonly edgeService: EdgeService,
  ) {
    super();
  }

  async boot(): Promise<void> {
    while (true) {
      try {
        await Promise.all([this.agentService.updateAgentState(), this.edgeService.syncEdgeStates()]);
      } catch (error) {
        this.logger.error(error);
      } finally {
        await delay(5 * 1000);
      }
    }
  }
}
