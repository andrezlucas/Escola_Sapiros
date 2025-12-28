import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateAlternativaDto {

  @IsNotEmpty()
  @IsString()
  texto: string;

  @IsNotEmpty()
  @IsBoolean()
  correta: boolean;

  @IsString()
  @IsOptional()
  letra?: string;



}