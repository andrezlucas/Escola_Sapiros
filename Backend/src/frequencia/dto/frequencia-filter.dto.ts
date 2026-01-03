import { Transform } from 'class-transformer';
import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';
import { StatusFrequencia } from '../entities/frequencia.entity';

export class FrequenciaFilterDto {
  @IsString()
  @IsOptional()
  alunoId?: string;

  @IsUUID('4',)
  @IsOptional()
  disciplinaId?: string;

  @IsUUID('4',)
  @IsOptional()
  turmaId?: string;

  @IsDateString()
  @IsOptional()
  dataInicio?: string;

  @IsDateString()
  @IsOptional()
  dataFim?: string;

  @IsEnum(StatusFrequencia, { message: `status deve ser um dos valores: ${Object.values(StatusFrequencia).join(', ')}` })
  @IsOptional()
  status?: StatusFrequencia;

  @IsBoolean({ message: 'Presente deve ser um valor booleano' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return undefined;
  })
  presente?: boolean;
}
