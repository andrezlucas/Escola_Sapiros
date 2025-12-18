import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsUUID,
  IsNotEmpty,
  IsPositive,
  Matches,
  IsIn,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class CreateTurmaDto {
  @IsString()
  @IsNotEmpty({ message: 'O nome da turma é obrigatório' })
  nome_turma: string;

  @IsString()
  @IsNotEmpty({ message: 'O ano letivo é obrigatório' })
  @Matches(/^\d{4}$/, { message: 'Ano letivo deve estar no formato YYYY' })
  anoLetivo: string;

  @IsString()
  @IsIn(['MANHÃ', 'TARDE', 'NOITE'], {
    message: 'O período deve ser MANHÃ, TARDE ou NOITE',
  })
  turno: string;

  @IsNumber()
  @IsPositive()
  @Min(1, { message: 'capacidade_maxima deve ser no mínimo 1' })
  @Max(30, { message: 'capacidade_maxima deve ser no máximo 30' })
  capacidade_maxima: number;

  @IsBoolean()
  @IsOptional()
  ativa?: boolean = true;

  @IsUUID('4', { message: 'O ID do professor deve ser um UUID válido' })
  @IsOptional()
  professorId?: string;

  @IsArray()
  @IsOptional()
  @IsUUID('4', { each: true, message: 'Cada ID de aluno deve ser um UUID válido' })
  alunosIds?: string[];
}
