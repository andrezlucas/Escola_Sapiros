import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotaStatus } from '../entities/nota.entity';
import { Bimestre } from '../../shared/enums/bimestre.enum';

export class FilterNotaDto {
  @IsUUID('4')
  @IsOptional()
  alunoId?: string;

  @IsUUID('4')
  @IsOptional()
  disciplinaId?: string;

  @IsEnum(Bimestre)
  @IsOptional()
  bimestre?: Bimestre;

  @IsEnum(NotaStatus)
  @IsOptional()
  status?: NotaStatus;
  
  @IsUUID('4')
  @IsOptional()
  turmaId?: string;
}