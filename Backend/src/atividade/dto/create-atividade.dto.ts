import { IsArray, IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { CreateQuestaoDto } from './create-questao.dto';
import { Type } from 'class-transformer';
import { IsUUID } from 'class-validator';

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
  @IsNotEmpty()
  @IsUUID(undefined, { each: true })
  turmaIds: string[];
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestaoDto)
  questoes: CreateQuestaoDto[];
  
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  habilidadesIds?: string[];
}