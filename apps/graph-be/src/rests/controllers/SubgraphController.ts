import { Body, Get, JsonController, Post, QueryParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';
import { CreateEdgeBody } from '../../libs/dto/CreateEdgeBody';
import { EdgeService } from '../../services/EdgeService';

@Service()
@JsonController('/edge')
@OpenAPI({})
export class SubgraphController {
  constructor(private readonly edgeService: EdgeService) {}

  @Get('/')
  async getContainer(
    @QueryParam('agentId', { required: true }) agentId: string,
    @QueryParam('page') page = 1,
    @QueryParam('size') size = 20,
  ) {
    return this.edgeService.getEdges({ agentId, page: Number(page), size: Number(size) });
  }

  @Post('/create')
  async createEdge(@Body() body: CreateEdgeBody) {
    return this.edgeService.createEdge(body);
  }
}
