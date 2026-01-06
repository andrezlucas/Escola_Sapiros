import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Max, Min, IsArray } from 'class-validator';
import { NotaStatus } from '../entities/nota.entity';
import { Bimestre } from '../../shared/enums/bimestre.enum';

export class CreateNotaDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  @IsOptional()
  nota1?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  habilidades1?: string[];

  @IsString()
  @IsOptional()
  feedback1?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10)
  @IsOptional()
  nota2?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  habilidades2?: string[];

  @IsString()
  @IsOptional()
  feedback2?: string;

  @IsEnum(Bimestre)
  @IsNotEmpty()
  bimestre: Bimestre;

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