import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Nota } from '../nota/entities/nota.entity';
import { Bimestre } from '../shared/enums/bimestre.enum';
import {
  Frequencia,
  StatusFrequencia,
} from '../frequencia/entities/frequencia.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { SolicitacaoDocumentoService } from './solicitacao-documentos.service';
import { TipoDocumentoEnum } from './entities/emissao-documentos.entity';

@Injectable()
export class EmissaoDocumentosService {
  constructor(
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
    @InjectRepository(Frequencia)
    private readonly frequenciaRepository: Repository<Frequencia>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @Inject(forwardRef(() => SolicitacaoDocumentoService))
    private readonly solicitacaoService: SolicitacaoDocumentoService,
  ) {}

  private adicionarCabecalho(doc: PDFKit.PDFDocument): void {
    const logoPath = 'assets/logo.sapiros.png';
    doc.image(logoPath, 237, 20, { width: 120 });

    doc.moveDown(7);
  }

  async gerarBoletimPDF(
    alunoId: string,
    ano: number,
    solicitacaoId?: string,
  ): Promise<Buffer> {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
      relations: ['turma', 'usuario'],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const notas = await this.notaRepository.find({
      where: { aluno: { id: alunoId } },
      relations: ['disciplina'],
    });

    const frequencias = await this.frequenciaRepository.find({
      where: { aluno: { id: alunoId } },
      relations: ['disciplina'],
    });

    const qrCodeDataUrl = await QRCode.toDataURL(
      `http://192.168.1.64:3000/documentos/verificar/${solicitacaoId || 'sem-solicitacao'}`,
    );

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 35 });
        const chunks: Buffer[] = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.image('assets/logo.sapiros.png', 220, 20, { width: 120 });
        doc.moveDown(6);

        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('BOLETIM ESCOLAR', { align: 'center' });
        doc.moveDown(1);

        doc.fontSize(12).font('Helvetica');
        doc.text(`Nome: ${aluno.usuario.nome || '—'}`, 45);
        doc.text(`Matrícula: ${aluno.matriculaAluno || '—'}`, 45);
        doc.text(`Turma: ${aluno.turma?.nome_turma || '—'}`, 45);
        doc.text(`Ano letivo: ${ano}`, 45);
        doc.moveDown(1.5);

        const notasAgrupadas: Record<
          string,
          {
            nome: string;
            bimestres: Partial<
              Record<Bimestre, { n1: number; n2: number; media?: number }>
            >;
          }
        > = {};

        notas.forEach((n) => {
          const discId = n.disciplina.id_disciplina;
          if (!notasAgrupadas[discId]) {
            notasAgrupadas[discId] = {
              nome: n.disciplina.nome_disciplina,
              bimestres: {},
            };
          }

          const bim = n.bimestre;
          if (!notasAgrupadas[discId].bimestres[bim]) {
            notasAgrupadas[discId].bimestres[bim] = { n1: 0, n2: 0 };
          }

          if (n.nota1 != null)
            notasAgrupadas[discId].bimestres[bim]!.n1 = parseFloat(
              n.nota1.toString(),
            );
          if (n.nota2 != null)
            notasAgrupadas[discId].bimestres[bim]!.n2 = parseFloat(
              n.nota2.toString(),
            );

          if (
            notasAgrupadas[discId].bimestres[bim]!.n1 &&
            notasAgrupadas[discId].bimestres[bim]!.n2
          ) {
            notasAgrupadas[discId].bimestres[bim]!.media =
              (notasAgrupadas[discId].bimestres[bim]!.n1 +
                notasAgrupadas[discId].bimestres[bim]!.n2) /
              2;
          }
        });

        const freqPorDisc: Record<string, { freq: number; total: number }> = {};
        frequencias.forEach((f) => {
          const discId = f.disciplina?.id_disciplina;
          if (discId) {
            if (!freqPorDisc[discId])
              freqPorDisc[discId] = { freq: 0, total: 0 };
            freqPorDisc[discId].total++;
            if (f.status === StatusFrequencia.PRESENTE)
              freqPorDisc[discId].freq++;
          }
        });

        const tableTop = doc.y;
        const leftMargin = 35;
        const rightMargin = 580;
        const colWidths = [145, 65, 65, 65, 65, 70, 60, 70];
        const colX: number[] = [leftMargin];
        colWidths.reduce((acc, w) => {
          const next = acc + w;
          colX.push(next);
          return next;
        }, leftMargin);

        const headers = [
          'Disciplina',
          'B1',
          'B2',
          'B3',
          'B4',
          'Média Final',
          'Freq.',
        ];

        doc.font('Helvetica-Bold').fontSize(9.8);
        headers.forEach((h, i) => {
          doc.text(h, colX[i], tableTop, {
            width: colWidths[i],
            align: i === 0 ? 'left' : 'center',
          });
        });

        doc
          .moveTo(leftMargin, tableTop + 14)
          .lineTo(rightMargin, tableTop + 14)
          .lineWidth(1)
          .stroke();
        colX.forEach((x) =>
          doc
            .moveTo(x, tableTop)
            .lineTo(x, tableTop + 14)
            .lineWidth(0.8)
            .stroke(),
        );

        let rowY = tableTop + 17;
        let somaMedias = 0;
        let countMedias = 0;

        Object.entries(notasAgrupadas).forEach(([discId, d]) => {
          const nomeDisc =
            d.nome.length > 22 ? d.nome.substring(0, 19) + '...' : d.nome;

          const bimValues = [
            d.bimestres[Bimestre.PRIMEIRO],
            d.bimestres[Bimestre.SEGUNDO],
            d.bimestres[Bimestre.TERCEIRO],
            d.bimestres[Bimestre.QUARTO],
          ];

          const bimStrs = bimValues.map((b) =>
            b ? `${b.n1.toFixed(1)}${b.n2 ? `|${b.n2.toFixed(1)}` : ''}` : '—',
          );

          const mediasBim = bimValues
            .filter((b) => b?.media !== undefined)
            .map((b) => b!.media!);
          let mediaFinal = '—';
          let situacao = 'Cursando';

          if (mediasBim.length > 0) {
            const mf = mediasBim.reduce((a, b) => a + b, 0) / mediasBim.length;
            mediaFinal = mf.toFixed(1);
            somaMedias += mf;
            countMedias++;
            situacao =
              mf >= 6 ? 'Aprovado' : mf >= 3 ? 'Recuperação' : 'Reprovado';
          }

          const freqData = freqPorDisc[discId];
          const freq =
            freqData && freqData.total > 0
              ? ((freqData.freq / freqData.total) * 100).toFixed(0) + '%'
              : '—';

          doc.font('Helvetica').fontSize(9.2);
          doc.text(nomeDisc, colX[0], rowY, {
            width: colWidths[0],
            align: 'left',
          });

          bimStrs.forEach((str, i) => {
            doc.text(str, colX[i + 1], rowY, {
              width: colWidths[i + 1],
              align: 'center',
            });
          });

          doc.text(mediaFinal, colX[5], rowY, {
            width: colWidths[5],
            align: 'center',
          });
          doc.text(freq, colX[6], rowY, {
            width: colWidths[6],
            align: 'center',
          });

          doc
            .moveTo(leftMargin, rowY + 14)
            .lineTo(rightMargin, rowY + 14)
            .lineWidth(0.5)
            .stroke();
          colX.forEach((x) => {
            doc
              .moveTo(x, rowY - 4)
              .lineTo(x, rowY + 14)
              .lineWidth(0.5)
              .stroke();
          });

          rowY += 18;

          if (rowY > 680) {
            doc.addPage({ margin: 35 });
            rowY = 60;
          }
        });

        const mediaGeral =
          countMedias > 0 ? (somaMedias / countMedias).toFixed(1) : '—';
        const situacaoGeral =
          mediaGeral !== '—' && parseFloat(mediaGeral) >= 6
            ? 'APROVADO'
            : 'RECUPERAÇÃO';

        doc.moveDown(2);
        doc.font('Helvetica-Bold').fontSize(11);
        doc.text(
          `Média Geral: ${mediaGeral}   |   Situação: ${situacaoGeral}`,
          45,
          rowY,
        );

        doc.moveDown(2);
        doc
          .font('Helvetica')
          .fontSize(9.5)
          .text(
            'Observação: Este documento é emitido com base nos registros oficiais da instituição até a data de emissão. ' +
              'A frequência é calculada considerando todas as aulas registradas.',
            45,
            doc.y,
            { width: 500, align: 'justify', lineGap: 3 },
          );

        doc.moveDown(3);
        doc
          .fontSize(10)
          .text(`Recife, ${new Date().toLocaleDateString('pt-BR')}`, 45);

        doc.moveDown(3);
        doc.moveTo(160, doc.y).lineTo(440, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(10).text('Secretaria Escolar', { align: 'center' });

        doc.moveDown(4);
        doc.image(qrCodeDataUrl, { fit: [80, 80], align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
  async gerarHistoricoEscolar(
    alunoId: string,
    solicitacaoId?: string,
  ): Promise<Buffer> {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
      relations: ['usuario', 'turma'],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const notas = await this.notaRepository.find({
      where: { aluno: { id: alunoId } },
      relations: ['disciplina'],
      order: { criadoEm: 'ASC' },
    });

    const qrCode = await QRCode.toDataURL(
      `http://localhost:3000/documentos/verificar/${solicitacaoId || 'sem-solicitacao'}`,
    );

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 }); // margem menor para ganhar espaço
        const chunks: Buffer[] = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.image('assets/logo.sapiros.png', 230, 25, { width: 110 });
        doc.moveDown(6);

        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('ESCOLA SAPIROS', { align: 'center' });
        doc.fontSize(10).text('TECNOLOGIA & RAZÃO', { align: 'center' });
        doc.moveDown(1);

        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('HISTÓRICO ESCOLAR', { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(12).font('Helvetica');
        doc.text(`Aluno(a): ${aluno.usuario.nome || '[Nome do Aluno]'}`);
        doc.text(
          `Data de Nascimento: ${aluno.usuario.dataNascimento ? new Date(aluno.usuario.dataNascimento).toLocaleDateString('pt-BR') : '[data]'}`,
        );
        doc.text(
          `RG/CPF: ${aluno.rgNumero || aluno.usuario.cpf || '[número]'}`,
        );
        doc.text(`Ano de Conclusão: 2026`);
        doc.text('Curso: Ensino Médio');
        doc.moveDown(2);

        const historico = notas.reduce(
          (
            acc: Record<
              string,
              Record<string, { nome: string; medias: number[] }>
            >,
            n,
          ) => {
            const ano = new Date(n.criadoEm).getFullYear().toString();
            if (!acc[ano]) acc[ano] = {};
            const id = n.disciplina.id_disciplina;
            if (!acc[ano][id]) {
              acc[ano][id] = { nome: n.disciplina.nome_disciplina, medias: [] };
            }
            if (n.nota1 != null && n.nota2 != null) {
              acc[ano][id].medias.push(
                (parseFloat(n.nota1.toString()) +
                  parseFloat(n.nota2.toString())) /
                  2,
              );
            }
            return acc;
          },
          {},
        );

        let tableY = doc.y;
        const leftMargin = 40;
        const rightMargin = 570;
        const colWidths = [100, 220, 80, 80, 80];
        const colX: number[] = [leftMargin];
        colWidths.reduce((acc, w) => {
          const next = acc + w;
          colX.push(next);
          return next;
        }, leftMargin);

        const headers = [
          'Série/Ano',
          'Disciplinas',
          'Carga Horária',
          'Média Final',
          'Situação',
        ];

        doc.font('Helvetica-Bold').fontSize(10.5);
        headers.forEach((header, i) => {
          doc.text(header, colX[i], tableY, {
            width: colWidths[i],
            align: i === 0 || i === 1 ? 'left' : 'center',
          });
        });

        doc
          .moveTo(leftMargin, tableY + 14)
          .lineTo(rightMargin, tableY + 14)
          .lineWidth(1.1)
          .stroke();

        colX.forEach((x) => {
          doc
            .moveTo(x, tableY)
            .lineTo(x, tableY + 14)
            .lineWidth(0.8)
            .stroke();
        });

        let yPos = tableY + 18;

        Object.entries(historico).forEach(([ano, disciplinas]) => {
          doc.font('Helvetica-Bold').fontSize(11);
          doc.text(`${ano}º Ano`, leftMargin, yPos, {
            width: colWidths[0],
            align: 'left',
          });
          yPos += 18;

          Object.values(disciplinas).forEach((d: any) => {
            let mediaStr = '—';
            let situacao = 'Pendente';

            if (d.medias.length > 0) {
              const soma = d.medias.reduce((a: number, b: number) => a + b, 0);
              const media = soma / d.medias.length;
              mediaStr = media.toFixed(1);
              situacao = media >= 5 ? 'Aprovado' : 'Reprovado';
            }

            const nomeDisc =
              d.nome.length > 35 ? d.nome.substring(0, 32) + '...' : d.nome;

            doc.font('Helvetica').fontSize(9.8);
            doc.text(`${ano}º Ano`, colX[0], yPos, {
              width: colWidths[0],
              align: 'left',
            });
            doc.text(nomeDisc, colX[1], yPos, {
              width: colWidths[1],
              align: 'left',
            });
            doc.text('200h', colX[2], yPos, {
              width: colWidths[2],
              align: 'center',
            });
            doc.text(mediaStr, colX[3], yPos, {
              width: colWidths[3],
              align: 'center',
            });
            doc.text(situacao, colX[4], yPos, {
              width: colWidths[4],
              align: 'center',
            });

            doc
              .moveTo(leftMargin, yPos + 14)
              .lineTo(rightMargin, yPos + 14)
              .lineWidth(0.6)
              .stroke();

            colX.forEach((x) => {
              doc
                .moveTo(x, yPos - 4)
                .lineTo(x, yPos + 14)
                .lineWidth(0.6)
                .stroke();
            });

            yPos += 18;

            if (yPos > 680) {
              doc.addPage({ margin: 40 });
              yPos = 80;
              tableY = 80;
            }
          });

          doc
            .moveTo(leftMargin, yPos)
            .lineTo(rightMargin, yPos)
            .lineWidth(1)
            .dash(3, { space: 2 })
            .stroke();
          yPos += 10;
        });

        doc.undash();

        doc.moveTo(40, yPos).lineTo(570, yPos).stroke();
        yPos += 20;

        doc
          .font('Helvetica')
          .fontSize(10)
          .text(
            'Observações: Cumpriu integralmente a carga horária mínima exigida por lei.',
            40,
            yPos,
            { width: 490, align: 'justify', lineGap: 4 },
          );

        yPos += 40;

        doc
          .fontSize(11)
          .text(`Recife, ${new Date().toLocaleDateString('pt-BR')}`, 40, yPos);

        yPos += 30;

        doc.moveTo(160, yPos).lineTo(440, yPos).stroke();
        yPos += 10;
        doc.fontSize(11).text('Secretário(a) Escolar', { align: 'center' });

        yPos += 40;

        doc.image(qrCode, {
          fit: [100, 100],
          align: 'center',
        });

        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }

  async gerarDeclaracaoMatricula(alunoId: string): Promise<Buffer> {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
      relations: ['usuario', 'turma'],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const texto =
      `Declaramos, para os devidos fins, que o(a) aluno(a) ${aluno.usuario.nome}, ` +
      `nascido(a) em ${aluno.usuario.dataNascimento}, portador(a) do documento nº ${aluno.rgNumero}, ` +
      `está regularmente matriculado(a) nesta instituição de ensino, no ` +
      `${aluno.turma?.nome_turma || '[ano/série/turma]'} do Ensino ` +
      `Médio, no turno da ${aluno.turma?.turno}, ` +
      `referente ao ano letivo de ${new Date().getFullYear()}.`;

    return this.gerarDeclaracao('Declaração de Matrícula', texto);
  }

  async gerarDeclaracaoFrequencia(alunoId: string): Promise<Buffer> {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
      relations: ['usuario', 'turma'],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const frequencias = await this.frequenciaRepository.find({
      where: { aluno: { id: alunoId } },
    });

    const total = frequencias.length;
    const presenca = frequencias.filter(
      (f) => f.status === StatusFrequencia.PRESENTE,
    ).length;
    const percentual = total ? ((presenca / total) * 100).toFixed(1) : '0.0';

    const texto =
      `Declaramos que o(a) aluno(a) ${aluno.usuario.nome} frequenta ` +
      `regularmente as aulas do ${aluno.turma?.nome_turma || '[ano/série/turma]'} ` +
      `do Ensino Médio, no turno ,${aluno.turma?.turno} ` +
      `mantendo frequência superior a ${percentual}% até a presente data.`;

    return this.gerarDeclaracao('Declaração de Frequência', texto);
  }

  async gerarDeclaracaoConclusao(alunoId: string): Promise<Buffer> {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
      relations: ['usuario'],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const texto =
      `Declaramos, para os devidos fins, que ${aluno.usuario.nome}, nascido(a) em ${aluno.usuario.dataNascimento}, ` +
      `concluiu com aproveitamento o Ensino Médio nesta instituição, no ano letivo de ${new Date().getFullYear()}, ` +
      `em conformidade com a legislação vigente.`;

    return this.gerarDeclaracao('Declaração de Conclusão', texto);
  }

  async gerarAtestadoVaga(alunoNome: string, serie: string): Promise<Buffer> {
    const texto =
      `Atestamos que há vaga disponível para o(a) aluno(a) ${alunoNome}, nascido(a) em [data de nascimento], ` +
      `para cursar o ${serie} do Ensino [Fundamental/Médio], no turno [matutino/vespertino/noturno], ` +
      `nesta instituição de ensino.`;

    return this.gerarDeclaracao('Atestado de Vaga / Transferência', texto);
  }

  async gerarDeclaracaoVinculoServidor(servidorId: string): Promise<Buffer> {
    const servidor = await this.usuarioRepository.findOne({
      where: { id: servidorId },
    });

    if (!servidor) throw new NotFoundException('Servidor não encontrado');

    return this.gerarDeclaracao(
      'DECLARAÇÃO DE VÍNCULO DE SERVIDOR',
      `Declaramos que ${servidor.nome} possui vínculo ativo com esta instituição.`,
    );
  }

  private gerarDeclaracao(
    titulo: string,
    textoPrincipal: string,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        this.adicionarCabecalho(doc);

        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text(titulo, { align: 'center' });

        doc.moveDown(1.5);

        doc.fontSize(12).font('Helvetica').text(textoPrincipal, {
          align: 'justify',
          lineGap: 5,
        });

        doc.moveDown(5);

        const cidade = 'Recife';
        const dataFormatada = new Date().toLocaleDateString('pt-BR');
        doc.text(`${cidade}, ${dataFormatada}`, { align: 'right' });

        doc.moveDown(1);

        doc.text('________________________________________', {
          align: 'center',
        });
        doc.text('Secretário(a) Escola', { align: 'center' });

        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }

  async verificarAutenticidadeUniversal(id: string) {
    const solicitacao = await this.solicitacaoService.buscarPorId(id);

    const dadosVerificacao: any = {
      status: 'DOCUMENTO AUTÊNTICO',
      codigo_autenticidade: id,
      data_emissao: solicitacao.criadoEm,
      titular: {
        nome: solicitacao.aluno.usuario.nome,
        matricula: solicitacao.aluno.matriculaAluno,
        turma: solicitacao.aluno.turma?.nome_turma,
      },
      info: {
        tipo: solicitacao.tipoDocumento,
        protocolo: solicitacao.protocolo,
      },
    };

    if (solicitacao.tipoDocumento === TipoDocumentoEnum.BOLETIM) {
      const notas = await this.notaRepository.find({
        where: { aluno: { id: solicitacao.aluno.id } },
        relations: ['disciplina'],
      });

      dadosVerificacao.notas = notas.map((n) => ({
        disciplina: n.disciplina.nome_disciplina,
        bimestre: n.bimestre,
        nota1: parseFloat(n.nota1.toString()),
        nota2: parseFloat(n.nota2.toString()),
        media:
          (parseFloat(n.nota1.toString()) + parseFloat(n.nota2.toString())) / 2,
      }));
    }

    return dadosVerificacao;
  }
}
