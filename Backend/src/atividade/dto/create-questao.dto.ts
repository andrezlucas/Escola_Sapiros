import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAlternativaDto } from './create-alternativa.dto';
import { ValidateNested } from 'class-validator';

export class CreateQuestaoDto {
    @IsNotEmpty()
    @IsString()
    enunciado: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    valor: number;

    @IsNotEmpty()
    @IsEnum(['MULTIPLA_ESCOLHA', 'DISSERTATIVA', 'VERDADEIRO_FALSO'])
    tipo: string;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateAlternativaDto)
    alternativas: CreateAlternativaDto[];
}