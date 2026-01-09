import { PartialType } from '@nestjs/mapped-types';
import { CreateSimuladoDto } from './create-simulado.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateSimuladoDto extends PartialType(CreateSimuladoDto) {
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}