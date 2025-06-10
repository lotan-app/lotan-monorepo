import { Authorized, Body, JsonController, Post } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { DeployEdgeBody } from 'src/libs/dtos/DeployEdgeBody';
import { UpdateBackupDbUrlBody } from 'src/libs/dtos/UpdateBackupDbUrlBody';
import { RestRoles } from 'src/libs/enums/RestRoles';
import { EdgeService } from 'src/services/EdgeService';
import { Service } from 'typedi';

@Service()
@JsonController('/edge')
@OpenAPI({})
export class EdgeController {
  constructor(private readonly edgeService: EdgeService) {}
  @Authorized(RestRoles.SYSTEM)
  @Post('/deploy')
  async deployEdge(@Body() body: DeployEdgeBody) {
    return this.edgeService.runEdge(body.edgeId);
  }

  @Authorized(RestRoles.SYSTEM)
  @Post('/update-backup-db-url')
  async updateBackupUrl(@Body() body: UpdateBackupDbUrlBody) {
    await this.edgeService.updateBackupUrl(body.edgeId, body.backupDbUrl);
    return 'OK';
  }
}
