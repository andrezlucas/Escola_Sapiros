import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Documentacao } from './entities/documentacao.entity';
import { Documento } from './entities/documento.entity';
import { TipoDocumento } from './enums/tipo-documento.enum';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentacaoService {
  constructor(
    @InjectRepository(Documentacao)
    private readonly documentacaoRepo: Repository<Documentacao>,

    @InjectRepository(Documento)
    private readonly documentoRepo: Repository<Documento>,
  ) {}

  /**
   * Substitui documento do mesmo tipo (se existir)
   */
  async substituirDocumento(
    documentacaoId: string,
    tipo: TipoDocumento,
    file: Express.Multer.File,
  ): Promise<Documento> {
    const documentacao = await this.documentacaoRepo.findOne({
      where: { id: documentacaoId },
      relations: ['documentos'],
    });

    if (!documentacao) {
      throw new NotFoundException('Documentação não encontrada');
    }

    const existente = documentacao.documentos.find(
      doc => doc.tipo === tipo,
    );

    if (existente) {
      // Remove arquivo físico
      if (fs.existsSync(existente.caminho)) {
        fs.unlinkSync(path.resolve(existente.caminho));
      }

      // Remove registro antigo
      await this.documentoRepo.remove(existente);
    }

    const novoDocumento = this.documentoRepo.create({
      tipo,
      nomeOriginal: file.originalname,
      nomeArquivo: file.filename,
      caminho: file.path,
      mimeType: file.mimetype,
      tamanho: file.size,
      documentacao,
    });

    return this.documentoRepo.save(novoDocumento);
  }
}
