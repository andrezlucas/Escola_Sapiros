import { IsString, IsOptional, Length, IsDateString, IsEmail, IsEnum, IsBoolean, IsNumberString, IsNotEmpty } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';
import { Sexo } from '../../usuario/entities/usuario.entity';

export class CreateAlunoDto extends CreateUsuarioDto {

  @IsNotEmpty()
  @IsString()
  serieAno: string;

  @IsNotEmpty()
  @IsString()
  escolaOrigem: string;

  @IsNotEmpty()
  @IsString()
  rgNumero: string;

  @IsNotEmpty()
  @IsDateString()
  rgDataEmissao: string;

  @IsNotEmpty()
  @IsString()
  rgOrgaoEmissor: string;

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
  autorizacaoSaidaSozinho?: boolean;

  @IsOptional()
  @IsBoolean()
  autorizacaoUsoImagem?: boolean;

  // Dados do Responsável
  @IsNotEmpty()
  @IsString()
  responsavelNome: string;

  @IsNotEmpty()
  @IsDateString()
  responsavel_Data_Nascimento: string;

  @IsNotEmpty()
  @IsEnum(Sexo)
  responsavel_sexo: Sexo;

  @IsNotEmpty()
  @IsString()
  responsavel_nacionalidade: string;

  @IsNotEmpty()
  @IsString()
  responsavel_naturalidade: string;

  @IsNotEmpty()
  @IsString()
  responsavelCpf: string;

  @IsNotEmpty()
  @IsString()
  responsavelRg: string;

  @IsNotEmpty()
  @IsString()
  responsavel_rg_OrgaoEmissor: string;

  @IsNotEmpty()
  @IsString()
  responsavelTelefone: string;

  @IsNotEmpty()
  @IsEmail()
  responsavelEmail: string;

  @IsNotEmpty()
  @IsString()
  responsavelCep: string;

  @IsNotEmpty()
  @IsString()
  responsavelLogradouro: string;

  @IsNotEmpty()
  @IsString()
  responsavelNumero: string;

  @IsOptional()
  @IsString()
  responsavelComplemento?: string;

  @IsNotEmpty()
  @IsString()
  responsavelBairro: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  responsavelEstado: string;

  @IsNotEmpty()
  @IsString()
  responsavelCidade: string;
}