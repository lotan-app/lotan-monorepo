import { IsNotEmpty, IsString } from 'class-validator';

export class DeployEdgeBody {
  @IsNotEmpty()
  @IsString()
  edgeId: string;
}
