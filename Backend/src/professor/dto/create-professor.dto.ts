import { IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';

export class CreateProfessorDto extends CreateUsuarioDto {
  // Campos herdados de CreateUsuarioDto: nome, cpf, email, role (implicitamente)

  @IsNotEmpty()
  @IsString()
  registroFuncional: string; // Exclusivo do Professor

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsNumber()
  cargaHoraria?: number;

  @IsOptional()
  @IsArray()
  disciplinasIds?: string[];

  @IsOptional()
  @IsString()
  formacao?: string; // Adicionado do seu último DTO
}