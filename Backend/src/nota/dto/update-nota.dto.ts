import { PartialType } from '@nestjs/mapped-types';
import { CreateNotaDto } from './create-nota.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateNotaDto extends PartialType(CreateNotaDto) {
  @IsUUID('4')
  @IsOptional()
  id?: string;
}