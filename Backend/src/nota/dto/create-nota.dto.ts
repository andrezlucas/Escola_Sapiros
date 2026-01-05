import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min, IsArray } from 'class-validator';
import { Bimestre, NotaStatus } from '../entities/nota.entity';

export class CreateNotaDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  @IsOptional()
  nota1?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  @IsOptional()
  nota2?: number;

  @IsEnum(Bimestre)
  @IsNotEmpty()
  bimestre: Bimestre;

  @IsString()
  @IsOptional()
  feedback?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  habilidades?: string[];

  @IsEnum(NotaStatus)
  @IsOptional()
  status?: NotaStatus;

  @IsUUID('4')
  @IsNotEmpty()
  alunoId: string;

  @IsUUID('4')
  @IsNotEmpty()
  disciplinaId: string;
}