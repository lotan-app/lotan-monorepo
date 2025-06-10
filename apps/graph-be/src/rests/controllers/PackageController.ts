import { Authorized, Get, JsonController, QueryParam } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { Service } from 'typedi';
import { PackageService } from '../../services/PackageService';
import { RestRoles } from '../../libs/enums/RestRoles';

@Service()
@JsonController('/package')
@OpenAPI({})
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Authorized(RestRoles.SYSTEM)
  @Get('/')
  async packages(@QueryParam('ids', { isArray: true, required: true, type: String }) ids: string[]) {
    return this.packageService.getPackageByIds(ids);
  }
}
