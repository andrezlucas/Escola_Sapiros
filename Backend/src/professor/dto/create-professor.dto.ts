import { IsString, IsDateString, IsOptional, Length,} from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateProfessorDto extends CreateUsuarioDto {
  // Campos herdados de CreateUsuarioDto: nome, cpf, email, sexo, role (implicitamente)
  
  @IsString()
  @Length(1, 100,)
  cursoGraduacao: string;

  @IsString()
  @Length(1, 100,)
  instituicao: string;

  @IsDateString()
  dataInicioGraduacao: string;

  @IsDateString()
  @IsOptional()
  dataConclusaoGraduacao?: string;

  


}