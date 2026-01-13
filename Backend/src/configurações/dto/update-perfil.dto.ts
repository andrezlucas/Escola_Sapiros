import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePerfilDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  senha?: string;
}
