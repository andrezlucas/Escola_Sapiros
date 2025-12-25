import { IsDateString, IsOptional } from 'class-validator';

export class FilterCalendarioDto {
  @IsDateString()
  inicio: string;

  @IsDateString()
  fim: string;
}