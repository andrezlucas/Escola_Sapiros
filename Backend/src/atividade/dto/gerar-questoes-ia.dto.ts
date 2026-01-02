import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class GerarQuestoesIaDto {
  @IsUUID()
  disciplinaId: string;

  @IsString()
  tema: string;

  @IsOptional()
  @IsArray()
  habilidadesIds?: string[];

  @IsInt()
  @Min(1)
  quantidade: number;

  @IsArray()
  @IsEnum(['MULTIPLA_ESCOLHA', 'DISSERTATIVA', 'VERDADEIRO_FALSO'], {
    each: true,
  })
  tipos: string[];
}
