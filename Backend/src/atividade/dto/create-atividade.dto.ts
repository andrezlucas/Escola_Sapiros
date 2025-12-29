import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestaoDto } from './create-questao.dto';

export class CreateAtividadeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNotEmpty()
  @IsDateString()
  dataEntrega: Date;

  @IsNumber()
  @IsOptional()
  valor?: number;

  @IsBoolean()
  @IsOptional()
  ativa?: boolean;

  @IsNotEmpty()
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