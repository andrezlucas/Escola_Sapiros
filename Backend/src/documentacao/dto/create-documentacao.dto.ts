import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCpf } from '../../shared/validators/is-cpf.validator';

export class CreateDocumentacaoDto {
  @IsNotEmpty()
  @IsString()
  @IsCpf({ message: 'CPF inválido' })
  cpf: string;

  @IsOptional()
  @IsString()
  rgNumero?: string;

  @IsOptional()
  @IsString()
  certidaoNumero?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsNotEmpty()
  @IsString()
  alunoId: string;
}
