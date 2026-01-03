import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, IsInt, Min, IsEnum } from 'class-validator';
import { StatusFrequencia } from '../entities/frequencia.entity';

export class CreateFrequenciaDto {
  @IsDateString()
  @IsNotEmpty({ message: 'Data é obrigatória' })
  data: string;

  @IsEnum(StatusFrequencia, { message: `status deve ser um dos valores: ${Object.values(StatusFrequencia).join(', ')}` })
  @IsOptional()
  status?: StatusFrequencia = StatusFrequencia.PRESENTE;

  @IsString()
  @IsOptional()
  justificativa?: string;

  @IsString()
  @IsNotEmpty()
  alunoId: string;

  @IsUUID('4',)
  @IsNotEmpty()
  disciplinaId: string; 

  @IsUUID('4',)
  @IsNotEmpty()
  turmaId: string;

  @IsInt()
  @Min(0,)
  @IsOptional()
  faltasNoPeriodo?: number;
}
