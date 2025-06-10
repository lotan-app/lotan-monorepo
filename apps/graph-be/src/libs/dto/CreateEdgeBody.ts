import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEdgeBody {
  @IsNotEmpty()
  @IsString()
  agentId: string;

  @IsNotEmpty()
  @IsNumber()
  port: number;

  @IsNotEmpty()
  @IsString()
  subgraphId: string;

  @IsNotEmpty()
  @IsString()
  limitCpu: string;

  @IsNotEmpty()
  @IsString()
  limitMem: string;
}
