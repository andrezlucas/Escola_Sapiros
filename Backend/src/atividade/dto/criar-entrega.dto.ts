import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CriarEntregaDto {
  @IsUUID()
  atividadeId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemRespostaDto)
  respostas: ItemRespostaDto[];
}

export class ItemRespostaDto {
  @IsUUID()
  questaoId: string;

  @IsOptional()
  @IsUUID()
  alternativaId?: string;

  @IsOptional()
  @IsString()
  textoResposta?: string;
}