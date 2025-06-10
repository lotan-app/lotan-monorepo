import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class Item {
  @IsOptional()
  @IsString()
  agentId: string;

  @IsNotEmpty()
  @IsString()
  id: string;

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

export class UpdateEdgeStateBody {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Item)
  data: Item[];
}
