import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Nota } from '../nota/entities/nota.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Frequencia, StatusFrequencia } from '../frequencia/entities/frequencia.entity';
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
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.fontSize(20).text('ESCOLA SAPIROS', { align: 'center' });
        doc.fontSize(16).text('BOLETIM ESCOLAR', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Aluno: ${aluno.usuario.nome}`);
        doc.text(`Matrícula: ${aluno.matriculaAluno}`);
        doc.text(`Turma: ${aluno.turma?.nome_turma || 'N/A'}`);
        doc.text(`Ano Letivo: ${ano}`);
        doc.moveDown();

        const notasAgrupadas = notas.reduce((acc, n) => {
          const id = n.disciplina.id_disciplina;
          if (!acc[id]) acc[id] = { nome: n.disciplina.nome_disciplina, itens: [] };
          acc[id].itens.push(n);
          return acc;
        }, {});

        Object.values(notasAgrupadas).forEach((d: any) => {
          doc.font('Helvetica-Bold').text(d.nome);
          doc.font('Helvetica');
          d.itens.forEach(n => {
            const media = ((n.nota1 + n.nota2) / 2).toFixed(2);
            doc.text(`Bimestre ${n.bimestre}: ${media}`, { indent: 20 });
          });
          doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.font('Helvetica-Bold').text('Frequência');
        doc.font('Helvetica');

        const freqAgrupada = frequencias.reduce((acc, f) => {
          const id = f.disciplina.id_disciplina;
          if (!acc[id]) acc[id] = { nome: f.disciplina.nome_disciplina, total: 0, presenca: 0 };
          acc[id].total++;
          if (f.status === StatusFrequencia.PRESENTE) acc[id].presenca++;
          return acc;
        }, {});

        Object.values(freqAgrupada).forEach((f: any) => {
          const p = ((f.presenca / f.total) * 100).toFixed(1);
          doc.text(`${f.nome}: ${p}%`);
        });

        doc.moveDown(2);
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
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.fontSize(20).text('ESCOLA SAPIROS', { align: 'center' });
        doc.fontSize(16).text('HISTÓRICO ESCOLAR', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`Aluno: ${aluno.usuario.nome}`);
        doc.text(`Matrícula: ${aluno.matriculaAluno}`);
        doc.text(`Turma Atual: ${aluno.turma?.nome_turma || 'N/A'}`);
        doc.moveDown();

        const historico = notas.reduce((acc, n) => {
          const ano = new Date(n.criadoEm).getFullYear();
          if (!acc[ano]) acc[ano] = {};
          const id = n.disciplina.id_disciplina;
          if (!acc[ano][id]) acc[ano][id] = { nome: n.disciplina.nome_disciplina, medias: [] };
          acc[ano][id].medias.push((n.nota1 + n.nota2) / 2);
          return acc;
        }, {});

        Object.entries(historico).forEach(([ano, disciplinas]: any) => {
          doc.font('Helvetica-Bold').text(`Ano ${ano}`);
          doc.font('Helvetica');
          Object.values(disciplinas).forEach((d: any) => {
            const media = (d.medias.reduce((a, b) => a + b, 0) / d.medias.length).toFixed(2);
            doc.text(`${d.nome}: ${media}`, { indent: 20 });
          });
          doc.moveDown();
        });

        doc.moveDown(2);
        doc.image(qrCode, { fit: [100, 100], align: 'center' });

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

    return this.gerarDeclaracao(
      'DECLARAÇÃO DE MATRÍCULA',
      `Declaramos que ${aluno.usuario.nome} está regularmente matriculado no ${aluno.turma?.nome_turma || 'ano letivo atual'}.`,
    );
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
    const presenca = frequencias.filter(f => f.status === StatusFrequencia.PRESENTE).length;
    const percentual = total ? ((presenca / total) * 100).toFixed(1) : '0.0';

    return this.gerarDeclaracao(
      'DECLARAÇÃO DE FREQUÊNCIA',
      `Declaramos que ${aluno.usuario.nome} possui frequência de ${percentual}%.`,
    );
  }

  async gerarDeclaracaoConclusao(alunoId: string): Promise<Buffer> {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
      relations: ['usuario'],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    return this.gerarDeclaracao(
      'DECLARAÇÃO DE CONCLUSÃO',
      `Declaramos que ${aluno.usuario.nome} concluiu com êxito os requisitos curriculares.`,
    );
  }

  async gerarAtestadoVaga(alunoNome: string, serie: string): Promise<Buffer> {
    return this.gerarDeclaracao(
      'ATESTADO DE VAGA',
      `Atestamos que há vaga disponível para ${alunoNome} na série ${serie}.`,
    );
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

  private gerarDeclaracao(titulo: string, texto: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];
        doc.on('data', c => chunks.push(c));
        doc.on('end', () => resolve(Buffer.concat(chunks)));

        doc.fontSize(20).text('ESCOLA SAPIROS', { align: 'center' });
        doc.moveDown(2);
        doc.fontSize(16).text(titulo, { align: 'center', underline: true });
        doc.moveDown(2);
        doc.fontSize(12).text(texto, { align: 'justify' });
        doc.moveDown(4);
        doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`, { align: 'right' });
        doc.moveDown(2);
        doc.text('________________________________________', { align: 'center' });
        doc.text('Secretaria Escolar', { align: 'center' });

        doc.end();
      } catch (e) {
        reject(e);
      }
    });
  }
}
