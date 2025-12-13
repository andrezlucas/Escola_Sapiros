import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  ParseEnumPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentacaoService } from './documentacao.service';
import { storageConfig } from '../upload/upload.config';
import { TipoDocumento } from './enums/tipo-documento.enum';

@Controller('documentacao')
export class DocumentacaoController {
  constructor(
    private readonly documentacaoService: DocumentacaoService,
  ) {}

  @Post(':documentacaoId/upload')
  @UseInterceptors(FileInterceptor('arquivo', storageConfig))
  substituir(
    @Param('documentacaoId') documentacaoId: string,
    @Body('tipo', new ParseEnumPipe(TipoDocumento)) tipo: TipoDocumento,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.documentacaoService.substituirDocumento(
      documentacaoId,
      tipo,
      file,
    );
  }
}