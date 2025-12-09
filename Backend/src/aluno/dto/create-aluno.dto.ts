import {
  IsString,
  IsOptional,
  Length,
  IsDateString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsArray,
  IsNumberString,
  IsNotEmpty,
} from 'class-validator';
import { CreateUsuarioDto, Sexo } from '../../usuario/dto/create-usuario.dto';

export class CreateAlunoDto extends CreateUsuarioDto {
  @IsString()
  serieAno: string;

  @IsOptional()
  @IsString()
  escolaOrigem?: string;

  // Dados Pessoais do Aluno (Removidos de Usuario DTO e adicionados aqui)
  @IsOptional()
  @IsNumberString()
  @Length(10, 15)
  telefone?: string;

  @IsNotEmpty()
  @IsDateString()
  data_nascimento: string;

  @IsEnum(Sexo)
  sexo: Sexo;

  @IsNotEmpty()
  @IsString()
  rgNumero: string;

  @IsOptional()
  @IsDateString()
  rgDataEmissao?: string;

  @IsOptional()
  @IsString()
  rgOrgaoEmissor?: string;

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

  @IsNotEmpty()
  @IsString()
  nacionalidade: string;

  @IsNotEmpty()
  @IsString()
  naturalidade: string;

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
  // Fim dos Dados Pessoais

  // Dados do Responsável
  @IsOptional()
  @IsString()
  responsavelNome?: string;

  @IsOptional()
  @IsDateString()
  responsavel_Data_Nascimento?: Date;

  @IsOptional()
  @IsEnum(Sexo)
  responsavel_sexo?: Sexo;

  @IsOptional()
  @IsString()
  responsavel_nacionalidade?: string;

  @IsOptional()
  @IsString()
  responsavel_naturalidade?: string;

  @IsOptional()
  @IsString()
  responsavelCpf?: string;

  @IsOptional()
  @IsString()
  responsavelRg?: string;

  @IsOptional()
  @IsString()
  responsavel_rg_OrgaoEmissor?: string;

  @IsOptional()
  @IsString()
  responsavelTelefone?: string;

  @IsOptional()
  @IsEmail()
  responsavelEmail?: string;

  @IsOptional()
  @IsString()
  responsavelCep?: string;

  @IsOptional()
  @IsString()
  responsavelLogradouro?: string;

  @IsOptional()
  @IsString()
  responsavelNumero?: string;

  @IsOptional()
  @IsString()
  responsavelComplemento?: string;

  @IsOptional()
  @IsString()
  responsavelBairro?: string;

  @IsOptional()
  @IsString()
  responsavelCidade?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  responsavelEstado?: string;
  // Fim dos Dados do Responsável

  @IsOptional()
  @IsArray()
  turmasIds?: string[];
}
