import { IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TipoAvaliacao, NotaStatus } from '../entities/nota.entity';

export class FilterNotaDto {
  @IsString()
  @IsOptional()
  alunoId?: string;

  @IsUUID('4')
  @IsOptional()
  disciplinaId?: string;

  @IsString()
  @IsOptional()
  avaliacaoNome?: string;

  @IsEnum(TipoAvaliacao)
  @IsOptional()
  tipoAvaliacao?: TipoAvaliacao;

  @IsEnum(NotaStatus)
  @IsOptional()
  status?: NotaStatus;

  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @IsDateString()
  @IsOptional()
  dataFim?: string;
  
  @IsOptional()
  @IsString()
  turmaId?: string;
}