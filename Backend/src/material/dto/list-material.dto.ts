import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { TipoMaterial } from '../enums/tipo-material.enum';

export class ListMaterialDto {
  @IsOptional()
  @IsUUID()
  turmaId?: string;

  @IsOptional()
  @IsUUID()
  disciplinaId?: string;

  @IsOptional()
  @IsEnum(TipoMaterial)
  tipo?: TipoMaterial;
}
