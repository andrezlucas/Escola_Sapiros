import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Length,
} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  identificador: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  senha: string;

  @IsOptional()
  @IsString()
  @Length(6, 6)
  codigo2fa?: string;

  @IsOptional()
  @IsString()
  codigoReserva?: string;
}
