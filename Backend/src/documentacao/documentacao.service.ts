import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Documentacao } from './entities/documentacao.entity';
import { Documento } from './entities/documento.entity';
import { TipoDocumento } from './enums/tipo-documento.enum';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class DocumentacaoService {
  constructor(
    @InjectRepository(Documentacao)
    private readonly documentacaoRepo: Repository<Documentacao>,

    @InjectRepository(Documento)
    private readonly documentoRepo: Repository<Documento>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Documentacao[]> {
    return this.documentacaoRepo.find({ relations: ['aluno', 'documentos'] });
  }

  async findOne(documentacaoId: string): Promise<Documentacao | null> {
    return this.documentacaoRepo.findOne({
      where: { id: documentacaoId },
      relations: ['aluno', 'documentos'],
    });
  }

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
      fs.existsSync(file.path) && fs.unlinkSync(path.resolve(file.path));
      throw new NotFoundException('Documentação não encontrada');
    }

    const existente = documentacao.documentos.find(
      doc => doc.tipo === tipo,
    );

    if (existente) {
      if (fs.existsSync(existente.caminho)) {
        fs.unlinkSync(path.resolve(existente.caminho));
      }
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

    const documentoSalvo = await this.documentoRepo.save(novoDocumento);

    await this.verificarEConcluirMatricula(documentacaoId);

    return documentoSalvo;
  }

  async removeDocumento(documentacaoId: string, documentoId: string): Promise<void> {
    const documento = await this.documentoRepo.findOne({
      where: { id: documentoId },
      relations: ['documentacao'],
    });

    if (!documento) {
      throw new NotFoundException('Documento não encontrado');
    }

    if (documento.documentacao.id !== documentacaoId) {
      throw new BadRequestException('Documento não pertence a esta documentação.');
    }

    if (fs.existsSync(documento.caminho)) {
      fs.unlinkSync(path.resolve(documento.caminho));
    }

    await this.documentoRepo.remove(documento);

    await this.verificarEConcluirMatricula(documentacaoId);
  }

  async remove(documentacaoId: string): Promise<void> {
    const documentacao = await this.documentacaoRepo.findOne({
        where: { id: documentacaoId },
        relations: ['documentos'],
    });

    if (!documentacao) {
        throw new NotFoundException('Documentação não encontrada');
    }

    documentacao.documentos.forEach(doc => {
        if (fs.existsSync(doc.caminho)) {
            fs.unlinkSync(path.resolve(doc.caminho));
        }
    });

    await this.documentacaoRepo.delete(documentacaoId);
  }

  async verificarEConcluirMatricula(documentacaoId: string): Promise<void> {
    const TIPOS_OBRIGATORIOS = [
        TipoDocumento.RG_ALUNO,
        TipoDocumento.CPF_ALUNO,
        TipoDocumento.CERTIDAO_NASCIMENTO,
        TipoDocumento.COMPROVANTE_RESIDENCIA_ALUNO,
        TipoDocumento.FOTO_3X4,
        TipoDocumento.HISTORICO_ESCOLAR,
    ];

    const documentosEnviados = await this.documentoRepo.find({
        where: { 
            documentacao: { id: documentacaoId }, 
            tipo: In(TIPOS_OBRIGATORIOS) as any 
        },
        select: ['tipo'],
    });

    const tiposUnicosEnviados = new Set(documentosEnviados.map(d => d.tipo));

    const documentosCompletos = tiposUnicosEnviados.size === TIPOS_OBRIGATORIOS.length;

    const documentacao = await this.documentacaoRepo.findOne({
        where: { id: documentacaoId },
        relations: ['aluno', 'aluno.usuario'],
    });

    const usuario = documentacao?.aluno?.usuario;

    if (!usuario) return;

    if (documentosCompletos && usuario.isBlocked) {
        usuario.isBlocked = false;
        await this.usuarioRepo.save(usuario);
    } else if (!documentosCompletos && !usuario.isBlocked) {
        usuario.isBlocked = true;
        await this.usuarioRepo.save(usuario);
    }
  }
}