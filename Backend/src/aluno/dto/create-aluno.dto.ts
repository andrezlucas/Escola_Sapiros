import {  IsString, IsOptional,  IsArray, IsUUID, Length, IsDateString, IsEmail, IsEnum } from 'class-validator';

export class CreateAlunoDto {
  @IsString()
  @Length(10, 10, { message: 'A matrícula deve ter 10 dígitos.' })
  matriculaAluno: string;

  @IsString()
  serieAno: string;

  @IsOptional()
  @IsString()
  escolaOrigem?: string;

  // Dados do Responsável
  @IsOptional()
  @IsString()
  responsavelNome?: string;

  @IsOptional()
  @IsDateString()
  responsavel_Data_Nascimento?: Date;

  @IsOptional()
  @IsEnum(['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'])
  responsavel_sexo?: string;

  @IsString()
  responsavel_nacionalidade: string;

  @IsString()
  responsavel_naturalidade: string;

  // Documentos
  @IsOptional()
  @IsString()
  responsavelCpf?: string;

  @IsOptional()
  @IsString()
  responsavelRg?: string;

  @IsOptional()
  @IsString()
  responsavel_rg_OrgaoEmissor?: string;

  // Contato
  @IsOptional()
  @IsString()
  responsavelTelefone?: string;

  @IsOptional()
  @IsEmail()
  responsavelEmail?: string;

  // Endereço
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
  @Length(2, 2, { message: 'O estado deve ter 2 caracteres.' })
  responsavelEstado?: string;

  // Relacionamentos
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @IsOptional()
  @IsArray()
  turmasIds?: string[];
}
