import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { TipoAviso } from '../entities/aviso.entity';

export class CreateAvisoDto {
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  nome: string;

  @IsString()
  @IsNotEmpty({ message: 'Descrição é obrigatória' })
  descricao: string;

  @IsEnum(TipoAviso)
  @IsOptional()
  tipo?: TipoAviso = TipoAviso.GERAL;

  @IsDateString({}, { message: 'dataInicio deve estar em formato ISO (YYYY-MM-DDTHH:mm:ssZ)' })
  @IsNotEmpty({ message: 'dataInicio é obrigatória' })
  dataInicio: string;

  @IsDateString({}, { message: 'datafinal deve estar em formato ISO (YYYY-MM-DDTHH:mm:ssZ)' })
  @IsOptional()
  datafinal?: string;

 
  @IsUUID('4')
  @IsOptional()
  usuarioId?: string;

  /**
   * turmaId: obrigatório quando tipo === TURMA
   */
  @IsUUID('4')
  @IsOptional()
  turmaId?: string;

  /**
   * destinatarioAlunoId: obrigatório quando tipo === INDIVIDUAL
   * representa Aluno.id (UUID)
   */
  @IsUUID('4')
  @IsOptional()
  destinatarioAlunoId?: string;
}
