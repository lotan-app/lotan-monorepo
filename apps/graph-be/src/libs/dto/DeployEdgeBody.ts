import { IsNotEmpty, IsString } from 'class-validator';

export class DeployEdgeBody {
  @IsNotEmpty()
  @IsString()
  subgraphApiKey: string;

  @IsNotEmpty()
  @IsString()
  subgraphUrl: string;
}
