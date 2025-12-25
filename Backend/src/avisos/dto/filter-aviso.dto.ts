import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TipoAviso, CategoriaAviso } from '../entities/aviso.entity';

export class FilterAvisoDto {
  @IsOptional()
  @IsEnum(TipoAviso)
  tipo?: TipoAviso;

  @IsOptional()
  @IsEnum(CategoriaAviso)
  categoria?: CategoriaAviso;

  @IsOptional()
  @IsUUID()
  responsavelId?: string;

  @IsOptional()
  @IsUUID()
  turmaId?: string;

  @IsOptional()
  @IsDateString()
  periodoInicio?: string;

  @IsOptional()
  @IsDateString()
  periodoFim?: string;

  @IsOptional()
  @IsString()
  termo?: string;
}

