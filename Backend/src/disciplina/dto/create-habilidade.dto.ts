import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateHabilidadeDto {
	@IsString()
	@IsNotEmpty({ message: 'Nome da habilidade é obrigatório' })
	@MaxLength(80, { message: 'Nome deve ter no máximo 80 caracteres' })
	nome: string;

	@IsOptional()
	@IsString({ message: 'Descricao deve ser texto' })
	@MaxLength(255, { message: 'Descricao deve ter no máximo 255 caracteres' })
	descricao?: string;

	@IsOptional()
	@IsInt({ message: 'Nivel deve ser um inteiro' })
	@Min(1, { message: 'Nivel mínimo é 1' })
	nivel?: number;
}
