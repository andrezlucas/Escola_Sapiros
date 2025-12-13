import { IsEnum, IsUUID } from 'class-validator';
import { TipoDocumento } from '../enums/tipo-documento.enum';

export class CreateDocumentacaoDto {
  @IsUUID()
  alunoId: string;

  @IsEnum(TipoDocumento)
  tipo: TipoDocumento;
}
