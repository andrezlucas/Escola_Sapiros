import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsCpf } from '../../shared/validators/is-cpf.validator'; 
import { Role } from '../entities/usuario.entity';

export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  OUTRO = 'OUTRO',
  NAO_INFORMADO = 'NAO_INFORMADO',
}

export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  @IsCpf({ message: 'O CPF informado é inválido. Verifique os dígitos.' })
  cpf: string;

  @IsEnum(Role)
  role: Role;
}