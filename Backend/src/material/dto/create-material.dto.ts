import {
  IsEnum,
  IsString,
  IsOptional,
  IsUUID,
  IsUrl,
  ValidateIf,
  MaxLength,
} from 'class-validator';
import { TipoMaterial } from '../enums/tipo-material.enum';
import { OrigemMaterial } from '../enums/origem-material.enum';

export class CreateMaterialDto {
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsEnum(TipoMaterial)
  tipo: TipoMaterial;

  @IsEnum(OrigemMaterial)
  origem: OrigemMaterial;

  // URL é obrigatória se origem for URL
  @ValidateIf((o) => o.origem === OrigemMaterial.URL)
  @IsUrl({}, { message: 'Por favor, insira um link válido para o material externo.' })
  url?: string;

  @IsOptional()
  @IsUUID()
  turmaId?: string;

  @IsOptional()
  @IsUUID()
  disciplinaId?: string;
}
