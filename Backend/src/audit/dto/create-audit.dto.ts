import { IsOptional, IsString, IsUUID, IsEnum, MaxLength } from 'class-validator';
import { Role } from '../../usuario/entities/usuario.entity';

export class CreateAuditDto {
  @IsOptional()
  @IsUUID()
  usuario_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  usuario_nome?: string;

  @IsOptional()
  @IsEnum(Role)
  usuario_role?: Role;

  @IsString()
  @MaxLength(255)
  acao: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  entidade?: string;

  @IsOptional()
  @IsUUID()
  entidade_id?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  ip?: string;

  @IsOptional()
  @IsString()
  user_agent?: string;
}
