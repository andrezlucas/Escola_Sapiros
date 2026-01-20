import { IsOptional, IsString, IsUUID, IsDateString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '../../usuario/entities/usuario.entity';

export class FilterAuditDto {
  @IsOptional()
  @IsUUID()
  usuario_id?: string;

  @IsOptional()
  @IsString()
  acao?: string;

  @IsOptional()
  @IsString()
  entidade?: string;

  @IsOptional()
  @IsUUID()
  entidade_id?: string;

  @IsOptional()
  @IsEnum(Role)
  usuario_role?: Role;

  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
