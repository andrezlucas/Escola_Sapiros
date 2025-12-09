import { IsNotEmpty, IsEnum } from 'class-validator';
import { CreateUsuarioDto } from '../../usuario/dto/create-usuario.dto';
import { FuncaoCoordenacao } from '../enums/funcao-coordenacao.enum';

export class CreateCoordenacaoDto extends CreateUsuarioDto {
  @IsNotEmpty({ message: 'funcao é obrigatória' })
  @IsEnum(FuncaoCoordenacao, {
    message: 'Função deve ser coordenador, diretor, secretario ou administrador',
  })
  funcao: FuncaoCoordenacao;
}
