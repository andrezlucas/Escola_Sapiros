import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  SolicitacaoDocumento,
  TipoDocumentoEnum,
  StatusSolicitacaoEnum,
  FormaEntregaEnum,
} from './entities/emissao-documentos.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Usuario, Role } from '../usuario/entities/usuario.entity';
import { EmissaoDocumentosService } from '../emissao-documentos/emissao-documentos.service';

@Injectable()
export class SolicitacaoDocumentoService {
  constructor(
    @InjectRepository(SolicitacaoDocumento)
    private readonly solicitacaoRepository: Repository<SolicitacaoDocumento>,
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
    private readonly emissaoService: EmissaoDocumentosService,
  ) {}

  async criarSolicitacao(
    usuario: Usuario,
    tipoDocumento: TipoDocumentoEnum,
    formaEntrega: FormaEntregaEnum,
    motivo?: string,
  ) {
    const aluno = await this.alunoRepository.findOne({
      where: { usuario: { id: usuario.id } },
      relations: ['usuario'],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const protocolo = `${new Date().getFullYear()}-${Date.now()}`;

    const solicitacao = this.solicitacaoRepository.create({
      protocolo,
      aluno,
      tipoDocumento,
      formaEntrega,
      motivo,
      status: StatusSolicitacaoEnum.PENDENTE,
    });

    return this.solicitacaoRepository.save(solicitacao);
  }

  async listarMinhasSolicitacoes(usuario: Usuario) {
    return this.solicitacaoRepository.find({
      where: {
        aluno: {
          usuario: { id: usuario.id },
        },
      },
      order: { criadoEm: 'DESC' },
    });
  }

  async dashboardSecretaria() {
    const [pendentes, emAndamento, concluidos] = await Promise.all([
      this.solicitacaoRepository.count({
        where: { status: StatusSolicitacaoEnum.PENDENTE },
      }),
      this.solicitacaoRepository.count({
        where: { status: StatusSolicitacaoEnum.EM_ANDAMENTO },
      }),
      this.solicitacaoRepository.count({
        where: { status: StatusSolicitacaoEnum.CONCLUIDO },
      }),
    ]);

    return { pendentes, emAndamento, concluidos };
  }

  async listarTodas(status?: StatusSolicitacaoEnum, search?: string) {
    const where: any = {};

    if (status) where.status = status;

    if (search) {
      where.aluno = {
        usuario: {
          nome: ILike(`%${search}%`),
        },
      };
    }

    return this.solicitacaoRepository.find({
      where,
      relations: ['aluno', 'aluno.usuario', 'atendidoPor'],
      order: { criadoEm: 'DESC' },
    });
  }

  async atualizarStatus(
    id: string,
    status: StatusSolicitacaoEnum,
    usuario: Usuario,
  ) {
    if (usuario.role !== Role.COORDENACAO)
      throw new ForbiddenException('Acesso negado');

    const solicitacao = await this.solicitacaoRepository.findOne({
      where: { id },
      relations: ['aluno', 'aluno.usuario'],
    });

    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada');

    solicitacao.status = status;
    solicitacao.atendidoPor = usuario;

    return this.solicitacaoRepository.save(solicitacao);
  }

  async emitirDocumento(id: string, usuario: Usuario): Promise<Buffer> {
    if (usuario.role !== Role.COORDENACAO)
      throw new ForbiddenException('Acesso negado');

    const solicitacao = await this.solicitacaoRepository.findOne({
      where: { id },
      relations: ['aluno', 'aluno.usuario'],
    });

    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada');

    let pdf: Buffer;

    switch (solicitacao.tipoDocumento) {
      case TipoDocumentoEnum.DECLARACAO_MATRICULA:
        pdf = await this.emissaoService.gerarDeclaracaoMatricula(
          solicitacao.aluno.id,
        );
        break;
      case TipoDocumentoEnum.DECLARACAO_FREQUENCIA:
        pdf = await this.emissaoService.gerarDeclaracaoFrequencia(
          solicitacao.aluno.id,
        );
        break;
      case TipoDocumentoEnum.DECLARACAO_CONCLUSAO:
        pdf = await this.emissaoService.gerarDeclaracaoConclusao(
          solicitacao.aluno.id,
        );
        break;
      case TipoDocumentoEnum.HISTORICO_ESCOLAR:
        pdf = await this.emissaoService.gerarHistoricoEscolar(
          solicitacao.aluno.id,
        );
        break;
      case TipoDocumentoEnum.BOLETIM:
        pdf = await this.emissaoService.gerarBoletimPDF(
          solicitacao.aluno.id,
          new Date().getFullYear(),
        );
        break;
      default:
        throw new NotFoundException('Tipo de documento inválido');
    }

    solicitacao.status = StatusSolicitacaoEnum.CONCLUIDO;
    solicitacao.atendidoPor = usuario;

    await this.solicitacaoRepository.save(solicitacao);

    return pdf;
  }

  async obterPdf(id: string, usuario: Usuario): Promise<Buffer> {
    const solicitacao = await this.solicitacaoRepository.findOne({
      where: { id },
      relations: ['aluno', 'aluno.usuario'],
    });

    if (!solicitacao) throw new NotFoundException('Solicitação não encontrada');

    if (
      usuario.role === Role.ALUNO &&
      solicitacao.aluno.usuario.id !== usuario.id
    ) {
      throw new ForbiddenException('Acesso negado');
    }

    if (solicitacao.status !== StatusSolicitacaoEnum.CONCLUIDO)
      throw new ForbiddenException('Documento ainda não concluído');

    switch (solicitacao.tipoDocumento) {
      case TipoDocumentoEnum.DECLARACAO_MATRICULA:
        return this.emissaoService.gerarDeclaracaoMatricula(
          solicitacao.aluno.id,
        );

      case TipoDocumentoEnum.DECLARACAO_FREQUENCIA:
        return this.emissaoService.gerarDeclaracaoFrequencia(
          solicitacao.aluno.id,
        );

      case TipoDocumentoEnum.DECLARACAO_CONCLUSAO:
        return this.emissaoService.gerarDeclaracaoConclusao(
          solicitacao.aluno.id,
        );

      case TipoDocumentoEnum.HISTORICO_ESCOLAR:
        return this.emissaoService.gerarHistoricoEscolar(solicitacao.aluno.id);

      case TipoDocumentoEnum.BOLETIM:
        return this.emissaoService.gerarBoletimPDF(
          solicitacao.aluno.id,
          new Date().getFullYear(),
        );

      default:
        throw new NotFoundException('Tipo de documento inválido');
    }
  }
}
