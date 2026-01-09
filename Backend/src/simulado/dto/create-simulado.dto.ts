import { 
  IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, 
  IsInt, IsUUID, IsArray, ArrayMinSize, ValidateNested, Min 
} from 'class-validator';
import { Type } from 'class-transformer';
import { Bimestre } from '../../shared/enums/bimestre.enum';
import { CreateQuestaoDto } from '../../atividade/dto/create-questao.dto';

export class CreateSimuladoDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

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
  @Min(1)
  tempoDuracao: number;

  @IsUUID()
  @IsNotEmpty()
  disciplinaId: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @ArrayMinSize(1)
  turmaIds: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestaoDto)
  @ArrayMinSize(20)
  questoes: CreateQuestaoDto[];
}