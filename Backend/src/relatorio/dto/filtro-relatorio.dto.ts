import { IsNotEmpty, IsOptional, IsUUID, IsString } from 'class-validator';

export class FiltroRelatorioDto {
  @IsUUID()
  @IsNotEmpty()
  disciplinaId: string;

  @IsString()
  @IsNotEmpty()
  bimestre: string;

  @IsUUID()
  @IsOptional()
  turmaId?: string;
}

export class FiltroComparativoDto {
  @IsUUID()
  @IsNotEmpty()
  disciplinaId: string;

  @IsUUID()
  @IsNotEmpty()
  habilidadeId: string;

  @IsString()
  @IsNotEmpty()
  bimestre: string;
}