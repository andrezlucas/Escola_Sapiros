import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { TipoAviso, CategoriaAviso } from '../entities/aviso.entity';

export class CreateAvisoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsEnum(TipoAviso)
  @IsOptional()
  tipo?: TipoAviso = TipoAviso.GERAL;

  @IsEnum(CategoriaAviso)
  categoria: CategoriaAviso;

  @IsDateString()
  dataInicio: string;

  @IsDateString()
  @IsOptional()
  dataFinal?: string;

  @IsUUID('4')
  @IsOptional()
  usuarioId?: string;

  @IsUUID('4')
  @IsOptional()
  turmaId?: string;

  @IsUUID('4')
  @IsOptional()
  destinatarioAlunoId?: string;

  @IsUUID('4')
  @IsOptional()
  destinatarioProfessorId?: string;
}

