import { IsString, ValidateNested, IsOptional, IsEnum, IsDateString, IsInt, IsUUID, IsArray, IsBoolean, IsNotEmpty, MaxLength } from 'class-validator';
import { Bimestre } from '../../shared/enums/bimestre.enum';
import { CreateQuestaoDto } from './create-questao.dto';
import { Type } from 'class-transformer';

export class CreateSimuladoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;
  
  @IsNotEmpty()
  @IsEnum(Bimestre)
  bimestre: Bimestre;

  @IsNotEmpty()
  @IsDateString()
  dataInicio: Date;

  @IsNotEmpty()
  @IsDateString()
  dataFim: Date;

  @IsNotEmpty()
  @IsInt()
  tempoDuracao: number;

  @IsNotEmpty()
  @IsDateString()
  iniciodaprova: Date; //Registra quando o aluno inicia o simulado

  @IsOptional()
  valortotal?: number;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;

  @IsUUID()
  professorId: string;

  @IsUUID()
  disciplinaId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  turmaIds: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestaoDto)
  questoes: CreateQuestaoDto[];
}
