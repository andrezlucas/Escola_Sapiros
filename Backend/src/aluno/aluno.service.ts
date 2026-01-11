import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, Not, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Aluno } from './entities/aluno.entity';
import { Usuario, Role, Sexo } from '../usuario/entities/usuario.entity';
import { Documentacao } from '../documentacao/entities/documentacao.entity';
import { Turma } from '../turma/entities/turma.entity';

import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { TransferirTurmaDto } from './dto/transferir-turma.dto';
import { Habilidade } from 'src/disciplina/entities/habilidade.entity';
import { Bimestre } from 'src/shared/enums/bimestre.enum';
import { TentativaSimulado } from 'src/simulado/entities/tentativa-simulado.entity';
import { Nota } from 'src/nota/entities/nota.entity';
import { Frequencia } from 'src/frequencia/entities/frequencia.entity';
import { Atividade } from 'src/atividade/entities/atividade.entity';
import { Entrega } from 'src/atividade/entities/entrega.entity';
import { StatusFrequencia} from 'src/frequencia/entities/frequencia.entity';

@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Documentacao)
    private readonly documentacaoRepository: Repository<Documentacao>,

    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    private readonly dataSource: DataSource,

    @InjectRepository(Habilidade)
    private readonly habilidadeRepository: Repository<Habilidade>,
    @InjectRepository(TentativaSimulado)
    private readonly tentativaSimuladoRepository: Repository<any>,
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
    @InjectRepository(Frequencia)
    private readonly frequenciaRepository: Repository<Frequencia>,
    @InjectRepository(Atividade)
    private readonly atividadeRepository: Repository<Atividade>,
  ) {}

  async create(dto: CreateAlunoDto): Promise<Aluno> {
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: [{ cpf: dto.cpf }, { email: dto.email }],
    });

    if (usuarioExistente) {
      throw new ConflictException('CPF ou Email já cadastrado');
    }

    return this.dataSource.transaction(async (manager) => {
      const usuario = manager.create(Usuario, {
        nome: dto.nome,
        email: dto.email,
        cpf: dto.cpf,
        telefone: dto.telefone,
        sexo: dto.sexo ?? Sexo.NAO_INFORMADO,
        dataNascimento: new Date(dto.data_nascimento),
        enderecoLogradouro: dto.enderecoLogradouro,
        enderecoNumero: dto.enderecoNumero,
        enderecoCep: dto.enderecoCep,
        enderecoComplemento: dto.enderecoComplemento,
        enderecoBairro: dto.enderecoBairro,
        enderecoEstado: dto.enderecoEstado,
        enderecoCidade: dto.enderecoCidade,
        senha: await bcrypt.hash('Sapiros@123', 10),
        role: Role.ALUNO,
        isBlocked: true,
      });

      const usuarioSalvo = await manager.save(usuario);

      const aluno = manager.create(Aluno, {
        usuario: usuarioSalvo,
        matriculaAluno: await this.generateMatricula(),
        serieAno: dto.serieAno,
        escolaOrigem: dto.escolaOrigem,
        rgNumero: dto.rgNumero,
        rgDataEmissao: new Date(dto.rgDataEmissao),
        rgOrgaoEmissor: dto.rgOrgaoEmissor,
        nacionalidade: dto.nacionalidade,
        naturalidade: dto.naturalidade,
        possuiNecessidadesEspeciais: dto.possuiNecessidadesEspeciais ?? false,
        descricaoNecessidadesEspeciais: dto.descricaoNecessidadesEspeciais,
        possuiAlergias: dto.possuiAlergias ?? false,
        descricaoAlergias: dto.descricaoAlergias,
        autorizacaoSaidaSozinho: dto.autorizacaoSaidaSozinho ?? false,
        autorizacaoUsoImagem: dto.autorizacaoUsoImagem ?? false,
        responsavelNome: dto.responsavelNome,
        responsavelDataNascimento: dto.responsavel_Data_Nascimento
          ? new Date(dto.responsavel_Data_Nascimento)
          : undefined,
        responsavel_sexo: dto.responsavel_sexo,
        responsavelNacionalidade: dto.responsavel_nacionalidade,
        responsavelNaturalidade: dto.responsavel_naturalidade,
        responsavelCpf: dto.responsavelCpf,
        responsavelRg: dto.responsavelRg,
        responsavelRgOrgaoEmissor: dto.responsavel_rg_OrgaoEmissor,
        responsavelTelefone: dto.responsavelTelefone,
        responsavelEmail: dto.responsavelEmail,
        responsavelCep: dto.responsavelCep,
        responsavelLogradouro: dto.responsavelLogradouro,
        responsavelNumero: dto.responsavelNumero,
        responsavelComplemento: dto.responsavelComplemento,
        responsavelBairro: dto.responsavelBairro,
        responsavelCidade: dto.responsavelCidade,
        responsavelEstado: dto.responsavelEstado,
      });

      const alunoSalvo = await manager.save(aluno);

      const documentacao = manager.create(Documentacao, {
        aluno: alunoSalvo,
      });

      alunoSalvo.documentacao = await manager.save(documentacao);

      return alunoSalvo;
    });
  }

  async findAll(): Promise<Aluno[]> {
    return this.alunoRepository.find({
      relations: ['usuario', 'documentacao', 'turma'],
    });
  }

  async findOne(id: string): Promise<Aluno> {
    const aluno = await this.alunoRepository.findOne({
      where: { id },
      relations: ['usuario', 'documentacao', 'turma'],
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return aluno;
  }

  async update(id: string, dto: UpdateAlunoDto): Promise<Aluno> {
    const aluno = await this.findOne(id);
    const usuario = aluno.usuario;

    if (dto.nome) usuario.nome = dto.nome;
    if (dto.email) usuario.email = dto.email;
    if (dto.serieAno) aluno.serieAno = dto.serieAno;
    if (dto.escolaOrigem) aluno.escolaOrigem = dto.escolaOrigem;

    await this.usuarioRepository.save(usuario);
    return this.alunoRepository.save(aluno);
  }

  async remove(id: string): Promise<void> {
    const aluno = await this.findOne(id);
    await this.alunoRepository.remove(aluno);
    await this.usuarioRepository.delete(id);
  }

  async transferirTurma(
    alunoId: string,
    dto: TransferirTurmaDto,
  ): Promise<Aluno> {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
      relations: ['turma'],
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    if (aluno.turma?.id === dto.turmaId) {
      throw new ConflictException('Aluno já está matriculado nesta turma');
    }

    const turma = await this.turmaRepository.findOne({
      where: { id: dto.turmaId },
      relations: ['alunos'],
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (
      turma.capacidade_maxima &&
      turma.alunos.length >= turma.capacidade_maxima
    ) {
      throw new ConflictException('Turma lotada');
    }

    aluno.turma = turma;
    return this.alunoRepository.save(aluno);
  }

  private async generateMatricula(): Promise<string> {
    const now = new Date();
    const ano = now.getFullYear().toString();
    const mes = (now.getMonth() + 1).toString().padStart(2, '0');

    const ultima = await this.alunoRepository
      .createQueryBuilder('aluno')
      .where('aluno.matricula_aluno LIKE :prefix', {
        prefix: `${ano}${mes}%`,
      })
      .orderBy('aluno.matricula_aluno', 'DESC')
      .getOne();

    const seq = ultima ? parseInt(ultima.matriculaAluno.slice(6), 10) + 1 : 1;

    return `${ano}${mes}${seq.toString().padStart(3, '0')}`;
  }

  async getPerfilAluno(usuarioId: string) {
    const aluno = await this.alunoRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: ['usuario', 'turma'],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    return {
      nome: aluno.usuario.nome,
      matricula: aluno.matriculaAluno,
      serieAno: aluno.serieAno,
      turma: aluno.turma?.nome_turma ?? null,
    };
  }
  async getResumoGeral(usuarioId: string, bimestre?: number) {
    const aluno = await this.alunoRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: ['notas', 'frequencias'],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const mapaBimestres = {
      1: Bimestre.PRIMEIRO,
      2: Bimestre.SEGUNDO,
      3: Bimestre.TERCEIRO,
      4: Bimestre.QUARTO,
    };

    const bimestreSelecionado = bimestre ? mapaBimestres[bimestre] : null;

    const notasFiltradas = bimestreSelecionado
      ? aluno.notas.filter((n) => n.bimestre === bimestreSelecionado)
      : aluno.notas;

    const todasNotas = notasFiltradas
      .flatMap((n) => [n.nota1, n.nota2])
      .filter((n) => n !== null && n !== undefined)
      .map(Number);

    const mediaGeral =
      todasNotas.length > 0
        ? todasNotas.reduce((s, n) => s + n, 0) / todasNotas.length
        : 0;

    const totalAulas = aluno.frequencias.length || 1;
    const presencas = aluno.frequencias.filter(
      (f) => f.status === 'presente',
    ).length;

    return {
      mediaGeral: Number(mediaGeral.toFixed(1)),
      frequencia: Math.round((presencas / totalAulas) * 100),
      notasContagem: notasFiltradas.length,
    };
  }

  async getNotasDetalhadas(usuarioId: string, bimestre?: number) {
    const aluno = await this.alunoRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: [
        'notas',
        'notas.disciplina',
        'frequencias',
        'frequencias.disciplina',
      ],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const mapaBimestres = {
      1: Bimestre.PRIMEIRO,
      2: Bimestre.SEGUNDO,
      3: Bimestre.TERCEIRO,
      4: Bimestre.QUARTO,
    };

    const bimestreSelecionado = bimestre ? mapaBimestres[bimestre] : null;

    const notasFiltradas = bimestreSelecionado
      ? aluno.notas.filter((n) => n.bimestre === bimestreSelecionado)
      : aluno.notas;

    return notasFiltradas.map((nota) => {
      const n1 =
        nota.nota1 !== null && nota.nota1 !== undefined
          ? Number(nota.nota1)
          : null;

      const n2 =
        nota.nota2 !== null && nota.nota2 !== undefined
          ? Number(nota.nota2)
          : null;

      const faltas = aluno.frequencias.filter(
        (f) =>
          f.disciplina.id_disciplina === nota.disciplina.id_disciplina &&
          f.status === 'falta',
      ).length;

      const notasValidas = [n1, n2].filter((n): n is number => n !== null);

      const mediaFinal =
        notasValidas.length > 0
          ? notasValidas.reduce((s, n) => s + n, 0) / notasValidas.length
          : null;

      return {
        disciplina: nota.disciplina.nome_disciplina,
        bimestre: nota.bimestre,
        avaliacao1: n1,
        avaliacao2: n2,
        mediaFinal: mediaFinal !== null ? Number(mediaFinal.toFixed(2)) : null,
        faltas,
      };
    });
  }

  async getDesempenhoPorHabilidade(usuarioId: string, bimestre?: number) {
    const aluno = await this.alunoRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: [
        'notas',
        'turma',
        'turma.atividades',
        'turma.atividades.questoes',
        'turma.atividades.questoes.habilidades',
        'entregas',
        'entregas.atividade',
        'entregas.respostas',
        'entregas.respostas.questao',
        'entregas.respostas.questao.habilidades',
      ],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const mapaBimestres = {
      1: Bimestre.PRIMEIRO,
      2: Bimestre.SEGUNDO,
      3: Bimestre.TERCEIRO,
      4: Bimestre.QUARTO,
    };

    const bimestreSelecionado = bimestre ? mapaBimestres[bimestre] : null;

    const mapaHabilidades: Record<
      string,
      { obtido: number; maximo: number; avaliacoes: number[] }
    > = {};

    const idsHabilidades = new Set<string>();

    const notasFiltradas = bimestreSelecionado
      ? aluno.notas.filter((n) => n.bimestre === bimestreSelecionado)
      : aluno.notas;

    for (const nota of notasFiltradas) {
      [
        { habs: nota.habilidades1, valor: Number(nota.nota1 || 0) },
        { habs: nota.habilidades2, valor: Number(nota.nota2 || 0) },
      ].forEach(({ habs, valor }) => {
        habs?.forEach((habId) => {
          idsHabilidades.add(habId);

          if (!mapaHabilidades[habId]) {
            mapaHabilidades[habId] = {
              obtido: 0,
              maximo: 0,
              avaliacoes: [],
            };
          }

          mapaHabilidades[habId].avaliacoes.push(valor);
        });
      });
    }

    const entregasAluno = aluno.entregas || [];

    for (const entrega of entregasAluno) {
      const atividade = entrega.atividade;
      if (!atividade) continue;

      if (bimestreSelecionado && atividade.bimestre !== bimestreSelecionado)
        continue;

      for (const resposta of entrega.respostas || []) {
        const questao = resposta.questao;
        if (!questao) continue;

        const notaObtidaTotal = Number(resposta.notaAtribuida || 0);
        const valorQuestaoTotal = Number((questao as any).valor || 1);

        const habilidades = questao.habilidades || [];
        if (habilidades.length === 0) continue;

        const valorPorHabilidade = valorQuestaoTotal / habilidades.length;
        const notaPorHabilidade = notaObtidaTotal > 0 ? valorPorHabilidade : 0;

        habilidades.forEach((habilidade) => {
          const habId = habilidade.id;
          idsHabilidades.add(habId);

          if (!mapaHabilidades[habId]) {
            mapaHabilidades[habId] = {
              obtido: 0,
              maximo: 0,
              avaliacoes: [],
            };
          }

          mapaHabilidades[habId].obtido += notaPorHabilidade;
          mapaHabilidades[habId].maximo += valorPorHabilidade;
        });
      }
    }

    const idsArray = [...idsHabilidades];
    if (idsArray.length === 0) return [];

    const habilidadesCadastradas = await this.habilidadeRepository.find({
      where: { id: In(idsArray) },
    });

    const mapaNomes = new Map(
      habilidadesCadastradas.map((h) => [h.id, h.nome]),
    );

    return Object.entries(mapaHabilidades).map(([id, dados]) => {
      const mediaAvaliacoes =
        dados.avaliacoes.length > 0
          ? dados.avaliacoes.reduce((s, v) => s + v, 0) /
            dados.avaliacoes.length
          : null;

      const percentualAtividades =
        dados.maximo > 0 ? dados.obtido / dados.maximo : null;

      let percentualFinal = 0;

      if (mediaAvaliacoes !== null && percentualAtividades !== null) {
        percentualFinal =
          percentualAtividades * 0.7 + (mediaAvaliacoes / 10) * 0.3;
      } else if (percentualAtividades !== null) {
        percentualFinal = percentualAtividades;
      } else if (mediaAvaliacoes !== null) {
        percentualFinal = mediaAvaliacoes / 10;
      }

      return {
        habilidade: mapaNomes.get(id) || id,
        percentual: Math.round(percentualFinal * 100),
      };
    });
  }

  async getHabilidadesADesenvolver(usuarioId: string, bimestre?: number) {
    const aluno = await this.alunoRepository.findOne({
      where: { usuario: { id: usuarioId } },
      relations: [
        'notas',
        'notas.disciplina',
        'entregas',
        'entregas.atividade',
        'entregas.respostas',
        'entregas.respostas.questao',
        'entregas.respostas.questao.habilidades',
      ],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const mapaBimestres = {
      1: Bimestre.PRIMEIRO,
      2: Bimestre.SEGUNDO,
      3: Bimestre.TERCEIRO,
      4: Bimestre.QUARTO,
    };

    const bimestreSelecionado = bimestre ? mapaBimestres[bimestre] : null;

    const consolidado: Record<
      string,
      {
        avaliacoes: number[];
        obtidoAtividades: number;
        maxAtividades: number;
        disciplina: string;
      }
    > = {};

    /**
     * =========================
     * NOTAS (AVALIAÇÕES)
     * =========================
     */
    const notasFiltradas = bimestreSelecionado
      ? aluno.notas.filter((n) => n.bimestre === bimestreSelecionado)
      : aluno.notas;

    for (const nota of notasFiltradas) {
      const discNome = nota.disciplina.nome_disciplina;

      [
        { habs: nota.habilidades1, valor: nota.nota1 },
        { habs: nota.habilidades2, valor: nota.nota2 },
      ].forEach(({ habs, valor }) => {
        habs?.forEach((habId) => {
          if (!consolidado[habId]) {
            consolidado[habId] = {
              avaliacoes: [],
              obtidoAtividades: 0,
              maxAtividades: 0,
              disciplina: discNome,
            };
          }
          if (valor !== null && valor !== undefined) {
            consolidado[habId].avaliacoes.push(Number(valor));
          }
        });
      });
    }

    /**
     * =========================
     * ATIVIDADES (ENTREGAS)
     * =========================
     */
    for (const entrega of aluno.entregas || []) {
      const atividade = entrega.atividade;
      if (!atividade) continue;

      if (bimestreSelecionado && atividade.bimestre !== bimestreSelecionado)
        continue;

      const disciplina = atividade.disciplina?.nome_disciplina || 'Geral';

      for (const resposta of entrega.respostas || []) {
        const questao = resposta.questao;
        if (!questao || !questao.habilidades?.length) continue;

        const valorQuestao = Number((questao as any).valor || 1);
        const valorPorHabilidade = valorQuestao / questao.habilidades.length;

        const notaObtida = Number(resposta.notaAtribuida || 0);
        const ganhou = notaObtida > 0;

        questao.habilidades.forEach((hab) => {
          const habId = hab.id;

          if (!consolidado[habId]) {
            consolidado[habId] = {
              avaliacoes: [],
              obtidoAtividades: 0,
              maxAtividades: 0,
              disciplina,
            };
          }

          consolidado[habId].maxAtividades += valorPorHabilidade;
          if (ganhou) {
            consolidado[habId].obtidoAtividades += valorPorHabilidade;
          }
        });
      }
    }

    const ids = Object.keys(consolidado);
    if (ids.length === 0) return [];

    const habilidades = await this.habilidadeRepository.find({
      where: { id: In(ids) },
    });

    const mapaNomes = new Map(habilidades.map((h) => [h.id, h.nome]));

    /**
     * =========================
     * MÉDIA FINAL
     * =========================
     */
    const lista = Object.entries(consolidado).map(([id, dados]) => {
      const mediaAvaliacoes =
        dados.avaliacoes.length > 0
          ? dados.avaliacoes.reduce((s, n) => s + n, 0) /
            dados.avaliacoes.length
          : null;

      const percentualAtividades =
        dados.maxAtividades > 0
          ? dados.obtidoAtividades / dados.maxAtividades
          : null;

      let mediaFinal = 0;

      if (mediaAvaliacoes !== null && percentualAtividades !== null) {
        mediaFinal = mediaAvaliacoes * 0.6 + percentualAtividades * 10 * 0.4;
      } else if (mediaAvaliacoes !== null) {
        mediaFinal = mediaAvaliacoes;
      } else if (percentualAtividades !== null) {
        mediaFinal = percentualAtividades * 10;
      }

      return {
        habilidade: mapaNomes.get(id) || id,
        disciplina: dados.disciplina,
        mediaFinal,
      };
    });

    return lista
      .sort((a, b) => a.mediaFinal - b.mediaFinal)
      .slice(0, 3)
      .map((item) => ({
        habilidade: item.habilidade,
        disciplina: item.disciplina,
      }));
  }
async getDesempenhoPorDisciplina(
  usuarioId: string,
  bimestre?: number,
) {
  const aluno = await this.alunoRepository.findOne({
    where: { usuario: { id: usuarioId } },
    relations: [
      'notas',
      'notas.disciplina',
      'frequencias',
      'frequencias.disciplina',
    ],
  });

  if (!aluno) {
    throw new NotFoundException('Aluno não encontrado');
  }

  const mapaBimestres = {
    1: Bimestre.PRIMEIRO,
    2: Bimestre.SEGUNDO,
    3: Bimestre.TERCEIRO,
    4: Bimestre.QUARTO,
  };

  const bimestreSelecionado = bimestre
    ? mapaBimestres[bimestre]
    : null;

  const notasFiltradas = bimestreSelecionado
    ? aluno.notas.filter(
        (n) => n.bimestre === bimestreSelecionado,
      )
    : aluno.notas;

  const frequenciasFiltradas = aluno.frequencias;


  const mapaNotas: Record<string, number[]> = {};
  const mapaFrequencia: Record<
    string,
    { total: number; presencas: number }
  > = {};

  
  notasFiltradas.forEach((nota) => {
    const nome = nota.disciplina.nome_disciplina;

    mapaNotas[nome] ??= [];
    mapaNotas[nome].push(
      Number(nota.nota1),
      Number(nota.nota2),
    );
  });

  //  Frequência (ACRÉSCIMO)
  frequenciasFiltradas.forEach((freq) => {
    const nome = freq.disciplina.nome_disciplina;

    mapaFrequencia[nome] ??= {
      total: 0,
      presencas: 0,
    };

    mapaFrequencia[nome].total++;

    if (freq.status === StatusFrequencia.PRESENTE) {
      mapaFrequencia[nome].presencas++;
    }
  });

  //  Retorno (ENRIQUECIDO, MAS COMPATÍVEL)
  return Object.entries(mapaNotas).map(
    ([disciplina, notas]) => {
      const media = Number(
        (
          notas.reduce((s, n) => s + n, 0) /
          notas.length
        ).toFixed(2),
      );

      const freq = mapaFrequencia[disciplina];
      const frequencia = freq
        ? Math.round((freq.presencas / freq.total) * 100)
        : 0;

      let status: 'BOM' | 'ATENCAO' | 'CRITICO' =
        'CRITICO';

      if (media >= 7) status = 'BOM';
      else if (media >= 5) status = 'ATENCAO';

      return {
        disciplina,
        media,
        frequencia,
        status,
      };
    },
  );
}



  async getResumoSimulados(usuarioId: string) {
  const aluno = await this.buscarAlunoPorUsuario(usuarioId);

  const tentativas = await this.tentativaSimuladoRepository.find({
    where: { aluno: { id: aluno.id } },
    order: { entregueEm: 'DESC' },
  });

  const entregues = tentativas.filter(t => t.entregueEm);

  const total = entregues.length;

  const mediaGeral =
    total > 0
      ? Number(
          (
            entregues.reduce((acc, t) => acc + Number(t.notaFinal), 0) /
            total
          ).toFixed(1),
        )
      : 0;

  const ultimoSimulado =
    total > 0 ? Number(entregues[0].notaFinal) : 0;

  return {
    ultimoSimulado,
    mediaGeral,
    simuladosRealizados: total,
  };
}

async getDesempenhoSimulados(usuarioId: string) {
  const aluno = await this.buscarAlunoPorUsuario(usuarioId);

  const tentativas = await this.tentativaSimuladoRepository.find({
    where: {
      aluno: { id: aluno.id },
      entregueEm: Not(IsNull()),
    },
    relations: ['simulado', 'simulado.disciplina'],
  });

  const mapa = new Map<string, { total: number; qtd: number }>();

  for (const t of tentativas) {
    const disciplina = t.simulado.disciplina.nome_disciplina;

    let atual = mapa.get(disciplina);

    if (!atual) {
      atual = { total: 0, qtd: 0 };
      mapa.set(disciplina, atual);
    }

    atual.total += Number(t.notaFinal);
    atual.qtd += 1;
  }

  return Array.from(mapa.entries()).map(([disciplina, dados]) => ({
    disciplina,
    media: Number((dados.total / dados.qtd).toFixed(1)),
  }));
}


async getHistoricoSimulados(usuarioId: string) {
  const aluno = await this.buscarAlunoPorUsuario(usuarioId);

  const tentativas = await this.tentativaSimuladoRepository.find({
    where: {
      aluno: { id: aluno.id },
      entregueEm: Not(IsNull()),
    },
    relations: ['simulado', 'simulado.disciplina'],
    order: { entregueEm: 'DESC' },
  });

  return tentativas.map(t => ({
    data: t.entregueEm,
    disciplina: t.simulado.disciplina.nome_disciplina,
    nota: Number(t.notaFinal),
  }));
}
async buscarAlunoPorUsuario(usuarioId: string): Promise<Aluno> {
    const aluno = await this.alunoRepository.findOne({
      where: {
        usuario: {
          id: usuarioId,
        },
      },
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado para este usuário');
    }

    return aluno;
  }

  async getAtividadesDisponiveis(usuarioId: string) {
  const aluno = await this.alunoRepository.findOne({
    where: { usuario: { id: usuarioId } },
    relations: ['turma'],
  });

  if (!aluno || !aluno.turma) {
    throw new NotFoundException('Aluno ou turma não encontrada');
  }

  const atividades = await this.dataSource
    .getRepository(Atividade)
    .createQueryBuilder('atividade')
    .innerJoin('atividade.turmas', 'turma', 'turma.id = :turmaId', {
      turmaId: aluno.turma.id,
    })
    .leftJoin(
      Entrega,
      'entrega',
      'entrega.atividade_id = atividade.id AND entrega.aluno_id = :alunoId',
      { alunoId: aluno.id },
    )
    .innerJoinAndSelect('atividade.disciplina', 'disciplina')
    .where('atividade.ativa = true')
    .andWhere('entrega.id IS NULL') // ainda não entregue
    .orderBy('atividade.dataEntrega', 'ASC')
    .getMany();

  return atividades.map((a) => ({
    id: a.id,
    titulo: a.titulo,
    disciplina: a.disciplina.nome_disciplina,
    entregaEm: a.dataEntrega,
  }));
}

  async getDashboardCompletoPorAlunoId(alunoId: string) {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId }, 
      relations: [
        'usuario',
        'turma',
        'notas',
        'frequencias',
        'entregas',
        'notas.disciplina',
        'turma.atividades',
        'turma.atividades.questoes',
        'turma.atividades.questoes.habilidades',
        'entregas.atividade',
        'entregas.respostas',
        'entregas.respostas.questao',
        'entregas.respostas.questao.habilidades',
      ],
    });

    if (!aluno) throw new NotFoundException('Aluno não encontrado');
    const todasNotas = aluno.notas
      .flatMap((n) => [n.nota1, n.nota2])
      .filter((n) => n !== null && n !== undefined)
      .map(Number);

    const mediaGeral =
      todasNotas.length > 0
        ? todasNotas.reduce((s, n) => s + n, 0) / todasNotas.length
        : 0;

    let statusAluno = 'Regular';
    if (mediaGeral >= 8) statusAluno = 'Excelente';
    else if (mediaGeral < 6) statusAluno = 'Crítico';

    const totalAulas = aluno.frequencias.length || 1;
    const presencas = aluno.frequencias.filter(
      (f) => f.status === StatusFrequencia.PRESENTE,
    ).length;
    const percentualFrequencia = Math.round((presencas / totalAulas) * 100);
    const totalAtividades = aluno.turma?.atividades?.filter(a => a.ativa).length || 0;
    const entregues = aluno.entregas?.length || 0; 
    const mapaHabilidades: Record<
      string,
      { nome: string; obtido: number; maximo: number; avaliacoes: number[] }
    > = {};
    for (const nota of aluno.notas) {
      [
        { habs: nota.habilidades1, valor: Number(nota.nota1 || 0) },
        { habs: nota.habilidades2, valor: Number(nota.nota2 || 0) },
      ].forEach(({ habs, valor }) => {
        habs?.forEach(async (habId) => {
          if (!mapaHabilidades[habId]) {
             mapaHabilidades[habId] = { nome: '', obtido: 0, maximo: 0, avaliacoes: [] };
          }
          mapaHabilidades[habId].avaliacoes.push(valor);
        });
      });
    }
    const entregasAluno = aluno.entregas || [];
    for (const entrega of entregasAluno) {
        const atividade = entrega.atividade;
        if (!atividade) continue;
        
        for (const resposta of entrega.respostas || []) {
            const questao = resposta.questao;
            if (!questao) continue;

            const notaObtidaTotal = Number(resposta.notaAtribuida || 0);
            const valorQuestaoTotal = Number((questao as any).valor || 1);
            const habilidades = questao.habilidades || [];
            
            if (habilidades.length === 0) continue;

            const valorPorHabilidade = valorQuestaoTotal / habilidades.length;
            const notaPorHabilidade = notaObtidaTotal > 0 ? valorPorHabilidade : 0;

            habilidades.forEach(h => {
                if (!mapaHabilidades[h.id]) {
                    mapaHabilidades[h.id] = { nome: h.nome, obtido: 0, maximo: 0, avaliacoes: [] };
                } else if (!mapaHabilidades[h.id].nome) {
                    mapaHabilidades[h.id].nome = h.nome;
                }
                mapaHabilidades[h.id].obtido += notaPorHabilidade;
                mapaHabilidades[h.id].maximo += valorPorHabilidade;
            });
        }
    }
    const idsSemNome = Object.keys(mapaHabilidades).filter(id => !mapaHabilidades[id].nome);
    if (idsSemNome.length > 0) {
        const habsDb = await this.habilidadeRepository.find({ where: { id: In(idsSemNome) } });
        habsDb.forEach(h => {
            if (mapaHabilidades[h.id]) mapaHabilidades[h.id].nome = h.nome;
        });
    }
    const listaCompetencias = Object.values(mapaHabilidades).map(dados => {
        const mediaAvaliacoes = dados.avaliacoes.length > 0
          ? dados.avaliacoes.reduce((s, v) => s + v, 0) / dados.avaliacoes.length
          : null;
        const percentualAtividades = dados.maximo > 0 ? dados.obtido / dados.maximo : null;
        
        let final = 0;
        if (mediaAvaliacoes !== null && percentualAtividades !== null) {
            final = percentualAtividades * 0.7 + (mediaAvaliacoes / 10) * 0.3;
        } else if (percentualAtividades !== null) {
            final = percentualAtividades;
        } else if (mediaAvaliacoes !== null) {
            final = mediaAvaliacoes / 10;
        }

        return {
            nome: dados.nome || 'Competência Geral',
            percentual: Math.round(final * 100)
        };
    });

    const sortedCompetencias = [...listaCompetencias].sort((a, b) => b.percentual - a.percentual);

    const pontosFortes = sortedCompetencias
        .filter(c => c.percentual >= 70) // Regra de negócio: acima de 70% é forte
        .slice(0, 3)
        .map(c => `Domínio em ${c.nome}`);
    const pontosAtencao = sortedCompetencias
        .filter(c => c.percentual < 60) // Regra de negócio: abaixo de 60% é atenção
        .slice(-3) 
        .map(c => `Dificuldade em ${c.nome}`);
    if (pontosFortes.length === 0 && sortedCompetencias.length > 0) pontosFortes.push(sortedCompetencias[0].nome); 
    return {
      header: {
        nome: aluno.usuario.nome,
        matricula: aluno.matriculaAluno,
        status: statusAluno, 
        foto: 'url_da_foto_se_tiver', 
      },
      kpis: {
        mediaGeral: Number(mediaGeral.toFixed(1)),
        frequencia: percentualFrequencia,
        tarefasEntregues: entregues,
        tarefasTotal: totalAtividades
      },
      competencias: listaCompetencias, 
      insights: {
        fortes: pontosFortes.length ? pontosFortes : ['Nenhum dado suficiente registrado'],
        atencao: pontosAtencao.length ? pontosAtencao : ['Nenhum ponto crítico identificado']
      }
    };
  }

}
