import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { TipoAvaliacao, NotaStatus } from '../entities/nota.entity';

export class CreateNotaDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  @IsOptional()
  valor?: number;

  @IsEnum(TipoAvaliacao)
  @IsOptional()
  tipoAvaliacao?: TipoAvaliacao;

  @IsString()
  @IsNotEmpty()
  avaliacaoNome: string;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsOptional()
  habilidades?: any;

  @IsEnum(NotaStatus)
  @IsOptional()
  status?: NotaStatus;

  @IsDateString()
  @IsNotEmpty()
  data: string;

  @IsString()
  @IsNotEmpty()
  matriculaAluno: string;

  @IsUUID('4')
  @IsNotEmpty()
  disciplinaId: string;
}