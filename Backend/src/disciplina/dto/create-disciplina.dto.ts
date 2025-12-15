import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateHabilidadeDto } from './create-habilidade.dto';

export class CreateDisciplinaDto {
  @IsString()
  @IsNotEmpty({ message: 'Código é obrigatório' })
  codigo_disciplina: string;

  @IsString()
  @IsNotEmpty({ message: 'Nome da disciplina é obrigatório' })
  nome_disciplina: string;

  @IsInt()
  @IsPositive()
  cargaHoraria: number;

  @IsOptional()
  @IsArray({ message: 'turmasIds deve ser uma lista de UUIDs' })
  @IsUUID('4', { each: true, message: 'Cada turmaId deve ser um UUID válido' })
  turmasIds?: string[];

  @IsOptional()
  @IsArray({ message: 'professoresIds deve ser uma lista de UUIDs' })
  @IsUUID('4', { each: true, message: 'Cada professorId deve ser um UUID válido' })
  professoresIds?: string[];

  @IsOptional()
  @IsArray({ message: 'habilidades deve ser uma lista' })
  @ValidateNested({ each: true })
  @Type(() => CreateHabilidadeDto)
  habilidades?: CreateHabilidadeDto[];
}
