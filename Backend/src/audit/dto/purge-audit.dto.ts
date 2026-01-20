import { IsDateString, IsOptional, IsString } from 'class-validator';

export class PurgeAuditDto {
  @IsOptional()
  @IsDateString()
  before?: string;
}
