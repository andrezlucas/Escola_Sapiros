import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Nota } from '../nota/entities/nota.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import {
  Frequencia,
  StatusFrequencia,
} from '../frequencia/entities/frequencia.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class EmissaoDocumentosService {
  constructor(
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,
    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Frequencia)
    private readonly frequenciaRepository: Repository<Frequencia>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  private adicionarCabecalho(doc: PDFKit.PDFDocument): void {
    const logoPath = 'assets/logo.sapiros.png';
    doc.image(logoPath, 237, 20, { width: 120 });

    doc.moveDown(7);
  }

  async gerarBoletimPDF(alunoId: string, ano: number): Promise<Buffer> {
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

    const qrCode = await QRCode.toDataURL(
      `https://escola-sapiros.com.br/verificar-boletim/${alunoId}/${ano}`,
    );

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 60 });
        const chunks: Buffer[] = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.image('assets/logo.sapiros.png', 237, 30, { width: 100 });
        doc.moveDown(5);

        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Boletim Escolar', { align: 'center' });
        doc.moveDown(1.5);

        doc.fontSize(12).font('Helvetica');
        doc.text(`Aluna(o): ${aluno.usuario.nome || '[Nome do Aluno]'}`);
        doc.text(
          `Matrícula: ${aluno.matriculaAluno || '[Número da Matrícula]'}`,
        );
        doc.text(`Turma/Série: ${aluno.turma?.nome_turma || '[Ex: 1º Ano A]'}`);
        doc.text(`Curso: Ensino Médio`);
        doc.moveDown(1);

        const notasAgrupadas = notas.reduce((acc: any, n) => {
          const id = n.disciplina.id_disciplina;
          if (!acc[id])
            acc[id] = {
              nome: n.disciplina.nome_disciplina,
              notas: [],
              freq: 0,
              totalAulas: 0,
            };
          acc[id].notas.push({
            bimestre: n.bimestre,
            nota1: n.nota1,
            nota2: n.nota2,
          });
          return acc;
        }, {});

        frequencias.forEach((f) => {
          const id = f.disciplina.id_disciplina;
          if (notasAgrupadas[id]) {
            notasAgrupadas[id].totalAulas++;
            if (f.status === StatusFrequencia.PRESENTE)
              notasAgrupadas[id].freq++;
          }
        });

        doc.font('Helvetica-Bold').fontSize(11);
        doc.text('Disciplina', 60, doc.y);
        doc.text('PI', 130, doc.y);
        doc.text('P2', 130, doc.y);
        doc.text('Média Final', 400, doc.y);
        doc.text('Frequência', 400, doc.y);
        doc.text('Situação', 500, doc.y);
        doc.moveDown(0.5);

        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        let yPos = doc.y;
        let somaMedias = 0;
        let totalDisciplinas = 0;

        Object.values(notasAgrupadas).forEach((d: any) => {
          let pi = '—',
            p2 = '—',
            mediaFinal = '—',
            freqPercent = '—',
            situacao = 'Pendente';

          const notaPI = d.notas.find((n: any) => n.bimestre === 1);
          const notaP2 = d.notas.find((n: any) => n.bimestre === 2);

          if (notaPI) pi = notaPI.nota1?.toFixed(1) || '—';
          if (notaP2) p2 = notaP2.nota1?.toFixed(1) || '—';

          if (
            notaPI &&
            notaP2 &&
            notaPI.nota1 != null &&
            notaP2.nota1 != null
          ) {
            const media = (notaPI.nota1 + notaP2.nota1) / 2;
            mediaFinal = media.toFixed(1);
            somaMedias += media;
            totalDisciplinas++;
            situacao = media >= 5 ? 'Aprovado' : 'Recuperação';
          }

          if (d.totalAulas > 0) {
            const freq = (d.freq / d.totalAulas) * 100;
            freqPercent = `${freq.toFixed(0)}%`;
          }

          doc.font('Helvetica').fontSize(11);
          doc.text(d.nome, 60, yPos, { width: 200 });
          doc.text(pi, 130, yPos);
          doc.text(p2, 170, yPos);
          doc.text(mediaFinal, 280, yPos);
          doc.text(freqPercent, 420, yPos);
          doc.text(situacao, 500, yPos);

          doc
            .moveTo(50, yPos + 15)
            .lineTo(550, yPos + 15)
            .stroke();

          yPos += 20;
        });

        doc.moveDown(1);
        const mediaGeral =
          totalDisciplinas > 0
            ? (somaMedias / totalDisciplinas).toFixed(1)
            : '—';
        const situacaoGeral =
          parseFloat(mediaGeral) >= 5 ? 'APROVADO' : 'RECUPERAÇÃO';

        doc
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(
            `Média Geral: ${mediaGeral}   Situação: ${situacaoGeral}`,
            60,
            doc.y,
          );

        doc.moveDown(2);

        doc
          .font('Helvetica')
          .fontSize(11)
          .text(
            'Observações: O(a) aluno(a) cumpriu satisfatoriamente os critérios de avaliação e frequência exigidos pelo regimento escolar vigente.',
            60,
            doc.y,
            { align: 'left', width: 480 },
          );

        doc.moveDown(3);

        doc
          .fontSize(12)
          .text(`Recife, ${new Date().toLocaleDateString('pt-BR')}`, 60, doc.y);

        doc.moveDown(4);

        doc.moveTo(150, doc.y).lineTo(450, doc.y).stroke();
        doc.moveDown(0.5);
        doc.text('Secretário(a) Escolar', { align: 'center' });

        doc.moveDown(4);

        doc.image(qrCode, { fit: [100, 100], align: 'center' });

        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }

  async gerarHistoricoEscolar(alunoId: string): Promise<Buffer> {
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
      `https://escola-sapiros.com.br/verificar-historico/${alunoId}`,
    );

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 60 });
        const chunks: Buffer[] = [];
        doc.on('data', (c) => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.image('assets/logo.sapiros.png', 237, 30, { width: 100 });
        doc.moveDown(5);

        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('ESCOLA SAPIROS', { align: 'center' });
        doc.fontSize(10).text('TECNOLOGIA & RAZÃO', { align: 'center' });
        doc.moveDown(1);

        doc
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Histórico Escolar', { align: 'center' });
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

        doc.font('Helvetica-Bold').fontSize(11);
        doc.text('Série/Ano', 60, doc.y);
        doc.text('Disciplinas', 130, doc.y);
        doc.text('Carga Horária', 280, doc.y);
        doc.text('Média Final', 360, doc.y);
        doc.text('Situação', 420, doc.y);
        doc.moveDown(0.5);

        doc.moveTo(50, doc.y).lineTo(550, doc.y).lineWidth(1).stroke();
        doc.moveDown(0.5);

        doc.font('Helvetica').fontSize(11);
        let yPos = doc.y;

        const historico = notas.reduce((acc: any, n) => {
          const ano = new Date(n.criadoEm).getFullYear();
          if (!acc[ano]) acc[ano] = {};
          const id = n.disciplina.id_disciplina;
          if (!acc[ano][id])
            acc[ano][id] = { nome: n.disciplina.nome_disciplina, medias: [] };

          if (n.nota1 != null && n.nota2 != null) {
            acc[ano][id].medias.push((n.nota1 + n.nota2) / 2);
          }

          return acc;
        }, {});

        Object.entries(historico).forEach(
          ([ano, disciplinas]: [string, any]) => {
            Object.values(disciplinas).forEach((d: any) => {
              let mediaStr = '—';
              let situacao = 'Pendente';

              if (d.medias.length > 0) {
                const soma = d.medias.reduce(
                  (a: number, b: number) => a + b,
                  0,
                );
                const media = soma / d.medias.length;
                mediaStr = media.toFixed(1);
                situacao = media >= 5 ? 'Aprovado' : 'Reprovado';
              }

              doc.text(`${ano}º Ano`, 60, yPos);
              doc.text(d.nome, 130, yPos);
              doc.text('200h', 280, yPos);
              doc.text(mediaStr, 360, yPos);
              doc.text(situacao, 420, yPos);

              yPos += 20;
            });
          },
        );

        doc.moveTo(50, yPos).lineTo(550, yPos).stroke();

        doc.moveDown(2);
        doc
          .fontSize(11)
          .text(
            'Observações: Cumpriu integralmente a carga horária mínima exigida por lei.',
            60,
            doc.y,
            { align: 'left', width: 480 },
          );

        doc.moveDown(3);

        doc
          .fontSize(12)
          .text(`Recife, ${new Date().toLocaleDateString('pt-BR')}`, 60, doc.y);

        doc.moveDown(4);

        doc.moveTo(150, doc.y).lineTo(450, doc.y).stroke();
        doc.moveDown(0.5);
        doc.fontSize(12).text('Secretário(a) Escolar', { align: 'center' });

        doc.moveDown(4);

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
}
