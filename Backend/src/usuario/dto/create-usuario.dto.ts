import { IsEmail,IsEnum, IsNotEmpty, MinLength, IsOptional, IsNumberString, IsString,Length, MaxLength, IsBoolean,IsDateString,} from 'class-validator';
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
  @IsNumberString()
  @Length(11, 11, { message: 'CPF deve ter 11 dígitos numéricos' })
  cpf: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  senha: string;

  @IsOptional()
  @IsNumberString()
  @Length(10, 15, { message: 'Telefone deve ter entre 10 e 15 dígitos numéricos' })
  telefone?: string;

  @IsNotEmpty()
  @IsDateString()
  data_nascimento: string; // string ISO

  @IsEnum(Sexo, { message: 'Sexo deve ser MASCULINO, FEMININO, OUTRO ou NAO_INFORMADO' })
  sexo: Sexo;

  // Documento RG
  @IsNotEmpty()
  @IsString()
  rgNumero: string;

  @IsOptional()
  @IsDateString()
  rgDataEmissao?: string; // string ISO

  @IsOptional()
  @IsString()
  rgOrgaoEmissor?: string;

  // Endereço
  @IsNotEmpty()
  @IsString()
  enderecoLogradouro: string;

  @IsNotEmpty()
  @IsString()
  enderecoNumero: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 8, { message: 'CEP deve ter 8 dígitos' })
  enderecoCep: string;

  @IsOptional()
  @IsString()
  enderecoComplemento?: string;

  @IsNotEmpty()
  @IsString()
  enderecoBairro: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2, { message: 'Estado deve ter 2 caracteres' })
  enderecoEstado: string;

  @IsNotEmpty()
  @IsString()
  enderecoCidade: string;

  @IsNotEmpty()
  @IsString()
  nacionalidade: string;

  @IsNotEmpty()
  @IsString()
  naturalidade: string;

  // Informações Complementares
  @IsOptional()
  @IsBoolean()
  possuiNecessidadesEspeciais?: boolean;

  @IsOptional()
  @IsString()
  descricaoNecessidadesEspeciais?: string;

  @IsOptional()
  @IsBoolean()
  possuiAlergias?: boolean;

  @IsOptional()
  @IsString()
  descricaoAlergias?: string;

  @IsOptional()
  @IsBoolean()
  autorizacaoUsoImagem?: boolean;

  @IsEnum(Role, { message: 'Role deve ser aluno, professor ou coordenacao' })
  role: Role;
}
