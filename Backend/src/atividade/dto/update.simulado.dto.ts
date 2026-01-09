import { PartialType } from '@nestjs/mapped-types'; 
import { CreateSimuladoDto } from './create-simulado.dto';

export class UpdateSimuladoDto extends PartialType(CreateSimuladoDto) {
    versao?: number;  
}