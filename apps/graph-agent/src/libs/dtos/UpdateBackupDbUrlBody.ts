import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBackupDbUrlBody {
  @IsNotEmpty()
  @IsString()
  edgeId: string;

  @IsNotEmpty()
  @IsString()
  backupDbUrl: string;
}
