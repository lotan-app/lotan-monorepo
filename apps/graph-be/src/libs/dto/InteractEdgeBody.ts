import { IsNotEmpty, IsString } from 'class-validator';

export class InteractEdgeBody {
  @IsNotEmpty()
  @IsString()
  edgeId: string;
}
