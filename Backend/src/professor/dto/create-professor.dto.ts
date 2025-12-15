import {
  IsString,
  IsDateString,
  IsOptional,
  Length,
  IsNotEmpty,
} from 'class-validator';

import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateProfessorDto extends CreateUsuarioDto {
 
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  cursoGraduacao: string;


  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  instituicao: string;

  @IsNotEmpty()
  @IsDateString()
  dataInicioGraduacao: string;

  @IsOptional()
  @IsDateString()
  dataConclusaoGraduacao?: string;
}
