import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateAgentStateBody {
  @IsNotEmpty()
  @IsString()
  agentId: string;

  @IsNotEmpty()
  @IsString()
  agentHost: string;

  @IsNotEmpty()
  @IsNumber()
  cpuUsage: number;

  @IsNotEmpty()
  @IsNumber()
  memLimit: number;

  @IsNotEmpty()
  @IsNumber()
  memUsage: number;

  @IsNotEmpty()
  @IsNumber()
  timestamp: number;
}
