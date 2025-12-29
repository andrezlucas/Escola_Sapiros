import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAlternativaDto } from './create-alternativa.dto';

export class CreateQuestaoDto {
  @IsNotEmpty()
  @IsString()
  enunciado: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  valor: number;

  @IsNotEmpty()
  @IsEnum(['MULTIPLA_ESCOLHA', 'DISSERTATIVA', 'VERDADEIRO_FALSO'])
  tipo: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  habilidadesIds?: string[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAlternativaDto)
  alternativas?: CreateAlternativaDto[];
}