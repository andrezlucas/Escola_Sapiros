// update-atividade.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateAtividadeDto } from './create-atividade.dto';

export class UpdateAtividadeDto extends PartialType(CreateAtividadeDto) {
  versao?: number;  
}