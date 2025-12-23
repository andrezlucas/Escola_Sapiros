import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';
import { FormacaoDto } from './formacao.dto';

export class CreateProfessorDto extends CreateUsuarioDto {

  @IsArray()
  @ArrayMinSize(1, { message: 'Professor deve ter ao menos uma formação' })
  @ValidateNested({ each: true })
  @Type(() => FormacaoDto)
  formacoes: FormacaoDto[];
}
