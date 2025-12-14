import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsNumberString, IsString, Length, IsDateString, } from 'class-validator';
import { Role, Sexo } from '../entities/usuario.entity';


export class CreateUsuarioDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsDateString()
  data_nascimento: string;

  @IsNotEmpty()
  @IsNumberString()
  @Length(11, 11, { message: 'CPF deve ter 11 dígitos numéricos' })
  cpf: string;

  @IsEnum(Sexo)
  @IsNotEmpty({ message: 'O campo sexo é obrigatório' })
  sexo: Sexo;

  @IsNotEmpty()
  @IsNumberString()
  @Length(10, 15)
  telefone: string;


  @IsNotEmpty()
  @IsString()
  enderecoLogradouro: string;

  @IsNotEmpty()
  @IsString()
  enderecoNumero: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 8)
  enderecoCep: string;

  @IsOptional()
  @IsString()
  enderecoComplemento?: string;

  @IsNotEmpty()
  @IsString()
  enderecoBairro: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  enderecoEstado: string;

  @IsNotEmpty()
  @IsString()
  enderecoCidade: string;


  @IsEnum(Role)
  role: Role;
}
