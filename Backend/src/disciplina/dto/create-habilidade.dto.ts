import { IsString, IsOptional, Length } from 'class-validator';

export class CreateHabilidadeDto {
  @IsString()
  @Length(2, 100)
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}
