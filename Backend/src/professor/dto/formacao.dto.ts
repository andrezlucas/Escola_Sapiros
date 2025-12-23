import { IsNotEmpty, IsDateString } from 'class-validator';

export class FormacaoDto {
  @IsNotEmpty()
  curso: string;

  @IsNotEmpty()
  instituicao: string;

  @IsDateString()
  dataInicio: Date;

  @IsDateString()
  dataConclusao?: Date;

  @IsNotEmpty()
  nivel: string;
}
