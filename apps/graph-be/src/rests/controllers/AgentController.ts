import { Get, JsonController, QueryParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';
import { AgentService } from '../../services/AgentService';

@Service()
@JsonController('/agent')
@OpenAPI({})
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get('/')
  async getAgents(@QueryParam('page') page = 1, @QueryParam('size') size = 20) {
    return this.agentService.getAgents({ page: Number(page), size: Number(size) });
  }
}
