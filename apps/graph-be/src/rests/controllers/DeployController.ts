import { Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';
import { DeployEdgeBody } from '../../libs/dto/DeployEdgeBody';
import { DeployService } from '../../services/DeployService';

@Service()
@JsonController('/deploy')
@OpenAPI({})
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  @Post('/edge')
  async deployEdge(@Body() body: DeployEdgeBody) {
    await this.deployService.deployEdge({
      subgraphApiKey: body.subgraphApiKey,
      subgraphUrl: body.subgraphUrl,
    });

    return {
      status: 'success',
    };
  }

  // @Post('/run-edge')
  // async runEdge(@Body() body: InteractEdgeBody) {
  //     return this.deployService.runEdge(body.edgeId)
  // }

  // @Post('/stop-edge')
  // async stopEdge(@Body() body: InteractEdgeBody) {
  //     return this.deployService.stopEdge(body.edgeId)
  // }

  // @Post('/remove-container')
  // async deleteEdge(@Body() body: InteractEdgeBody) {
  //     return this.deployService.removeContainer(body.edgeId)
  // }

  // @Post('/restart-edge')
  // async restartEdge(@Body() body: InteractEdgeBody) {
  //     return this.deployService.restartEdge(body.edgeId)
  // }

  // @Post('/start-edge')
  // async startEdge(@Body() body: InteractEdgeBody) {
  //     return this.deployService.startEdge(body.edgeId)
  // }
}
