import { PartialType } from '@nestjs/mapped-types'; 
import { CreateSimuladoDto } from './create-simulado.entity';

export class UpdateSimuladoDto extends PartialType(CreateSimuladoDto) {
    versao?: number;  
}