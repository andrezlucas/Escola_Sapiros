import { IsBoolean } from 'class-validator';

export class AceiteTermoDto {
  @IsBoolean()
  aceito: boolean;
}
