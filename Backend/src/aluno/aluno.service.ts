import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
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
        possuiNecessidadesEspeciais:
          dto.possuiNecessidadesEspeciais ?? false,
        descricaoNecessidadesEspeciais:
          dto.descricaoNecessidadesEspeciais,
        possuiAlergias: dto.possuiAlergias ?? false,
        descricaoAlergias: dto.descricaoAlergias,
        autorizacaoSaidaSozinho:
          dto.autorizacaoSaidaSozinho ?? false,
        autorizacaoUsoImagem:
          dto.autorizacaoUsoImagem ?? false,
        responsavelNome: dto.responsavelNome,
        responsavelDataNascimento:
          dto.responsavel_Data_Nascimento
            ? new Date(dto.responsavel_Data_Nascimento)
            : undefined,
        responsavel_sexo: dto.responsavel_sexo,
        responsavelNacionalidade: dto.responsavel_nacionalidade,
        responsavelNaturalidade: dto.responsavel_naturalidade,
        responsavelCpf: dto.responsavelCpf,
        responsavelRg: dto.responsavelRg,
        responsavelRgOrgaoEmissor:
          dto.responsavel_rg_OrgaoEmissor,
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
      throw new ConflictException(
        'Aluno já está matriculado nesta turma',
      );
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
    const mes = (now.getMonth() + 1)
      .toString()
      .padStart(2, '0');

    const ultima = await this.alunoRepository
      .createQueryBuilder('aluno')
      .where('aluno.matricula_aluno LIKE :prefix', {
        prefix: `${ano}${mes}%`,
      })
      .orderBy('aluno.matricula_aluno', 'DESC')
      .getOne();

    const seq = ultima
      ? parseInt(ultima.matriculaAluno.slice(6), 10) + 1
      : 1;

    return `${ano}${mes}${seq
      .toString()
      .padStart(3, '0')}`;
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
    relations: ['notas', 'frequencias', 'turma', 'turma.atividades'],
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
    ? aluno.notas.filter(n => n.bimestre === bimestreSelecionado) 
    : aluno.notas;

  const atividadesFiltradas = (aluno.turma?.atividades || []).filter(a => 
    !bimestreSelecionado || a.bimestre === bimestreSelecionado
  );

  const todasNotas = [
    ...notasFiltradas.flatMap(n => [Number(n.nota1), Number(n.nota2)]),
    ...atividadesFiltradas.map(a => Number(a.valor || 0))
  ];

  const mediaGeral = todasNotas.length > 0 
    ? todasNotas.reduce((s, n) => s + n, 0) / todasNotas.length 
    : 0;

  const totalAulas = aluno.frequencias.length || 1;
  const presencas = aluno.frequencias.filter(f => f.status === 'presente').length;
  
  return {
    mediaGeral: Number(mediaGeral.toFixed(1)),
    frequencia: Math.round((presencas / totalAulas) * 100),
    atividadesContagem: atividadesFiltradas.length,
    notasContagem: notasFiltradas.length
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
      'turma', 
      'turma.atividades', 
      'turma.atividades.disciplina'
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
    ? aluno.notas.filter(n => n.bimestre === bimestreSelecionado)
    : aluno.notas;

  return notasFiltradas.map(nota => {
    const n1 = Number(nota.nota1);
    const n2 = Number(nota.nota2);
    
    const faltas = aluno.frequencias.filter(f => 
      f.disciplina.id_disciplina === nota.disciplina.id_disciplina && 
      f.status === 'falta'
    ).length;

    const atividadesDisc = (aluno.turma?.atividades || []).filter(a => 
      a.disciplina?.id_disciplina === nota.disciplina.id_disciplina &&
      (!bimestreSelecionado || a.bimestre === bimestreSelecionado)
    );
    
    const somaAtividades = atividadesDisc.reduce((s, a) => s + Number(a.valor || 0), 0);
    const mediaAtividades = atividadesDisc.length > 0 ? somaAtividades / atividadesDisc.length : 0;

    return {
      disciplina: nota.disciplina.nome_disciplina,
      bimestre: nota.bimestre,
      avaliacao1: n1,
      avaliacao2: n2,
      mediaAtividades: Number(mediaAtividades.toFixed(2)),
      mediaFinal: Number(((n1 + n2 + mediaAtividades) / 3).toFixed(2)),
      faltas,
    };
  });
}

async getDesempenhoPorHabilidade(usuarioId: string, bimestre?: number) {
  const aluno = await this.alunoRepository.findOne({
    where: { usuario: { id: usuarioId } },
    // Acessamos as atividades via Turma, carregando as Disciplinas e Questões (onde costumam estar as habilidades)
    relations: [
      'notas', 
      'turma', 
      'turma.atividades', 
      'turma.atividades.questoes'
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
  const mapaHabilidades: Record<string, { avaliacoes: number[], atividades: number[] }> = {};
  const idsHabilidades = new Set<string>();

  // 1. PROCESSAR NOTAS (AVALIAÇÕES)
  const notasFiltradas = bimestreSelecionado 
    ? aluno.notas.filter(n => n.bimestre === bimestreSelecionado) 
    : aluno.notas;

  for (const nota of notasFiltradas) {
    [nota.habilidades1, nota.habilidades2].forEach((habs, idx) => {
      if (habs && Array.isArray(habs)) {
        const valorNota = idx === 0 ? Number(nota.nota1) : Number(nota.nota2);
        habs.forEach(id => {
          idsHabilidades.add(id);
          if (!mapaHabilidades[id]) mapaHabilidades[id] = { avaliacoes: [], atividades: [] };
          mapaHabilidades[id].avaliacoes.push(valorNota);
        });
      }
    });
  }

  // 2. PROCESSAR ATIVIDADES (VIA TURMA)
  const atividadesDaTurma = aluno.turma?.atividades || [];
  const atividadesFiltradas = atividadesDaTurma.filter(a => 
    !bimestreSelecionado || a.bimestre === bimestreSelecionado
  );

  for (const atividade of atividadesFiltradas) {
    // Se as habilidades estiverem nas QUESTÕES da atividade:
    const habilidadesDaAtividade = new Set<string>();
    
    // Coleta habilidades de todas as questões desta atividade
    atividade.questoes?.forEach(q => {
      // Ajuste 'habilidadeId' conforme o nome real do campo na sua entidade Questao
      if ((q as any).habilidadeId) {
        habilidadesDaAtividade.add((q as any).habilidadeId);
      }
    });

    // Se a atividade em si tiver um array de habilidades (como campo JSON), use:
    // const habsFixas = (atividade as any).habilidades || [];

    habilidadesDaAtividade.forEach(id => {
      idsHabilidades.add(id);
      if (!mapaHabilidades[id]) mapaHabilidades[id] = { avaliacoes: [], atividades: [] };
      mapaHabilidades[id].atividades.push(Number(atividade.valor || 0));
    });
  }

  const idsArray = [...idsHabilidades];
  if (idsArray.length === 0) return [];

  const habilidadesCadastradas = await this.dataSource.getRepository(Habilidade).find({
    where: { id: In(idsArray) }
  });

  const mapaNomes = new Map(habilidadesCadastradas.map(h => [h.id, h.nome]));

  // 3. CÁLCULO DA MÉDIA DAS MÉDIAS (PESO IGUAL PARA OS DOIS TIPOS)
  return Object.entries(mapaHabilidades).map(([id, dados]) => {
    const mediaAvaliacoes = dados.avaliacoes.length > 0 
      ? dados.avaliacoes.reduce((s, v) => s + v, 0) / dados.avaliacoes.length 
      : null;

    const mediaAtividades = dados.atividades.length > 0 
      ? dados.atividades.reduce((s, v) => s + v, 0) / dados.atividades.length 
      : null;

    let mediaFinal = 0;

    if (mediaAvaliacoes !== null && mediaAtividades !== null) {
      mediaFinal = (mediaAvaliacoes + mediaAtividades) / 2;
    } else {
      mediaFinal = mediaAvaliacoes ?? mediaAtividades ?? 0;
    }

    return {
      habilidade: mapaNomes.get(id) || id,
      percentual: Math.round(mediaFinal * 10), // Converte de escala 0-10 para 0-100%
    };
  });
}

async getHabilidadesADesenvolver(usuarioId: string, bimestre?: number) {
  const aluno = await this.alunoRepository.findOne({
    where: { usuario: { id: usuarioId } },
    relations: [
      'notas', 
      'notas.disciplina', 
      'turma', 
      'turma.atividades', 
      'turma.atividades.disciplina', 
      'turma.atividades.questoes'
    ],
  });

  if (!aluno) throw new NotFoundException('Aluno não encontrado');

  const mapaBimestres = {
    1: Bimestre.PRIMEIRO, 2: Bimestre.SEGUNDO,
    3: Bimestre.TERCEIRO, 4: Bimestre.QUARTO,
  };
  const bimestreSelecionado = bimestre ? mapaBimestres[bimestre] : null;

  // Mapa para separar os tipos de notas por habilidade
  const consolidado: Record<string, { avaliacoes: number[], atividades: number[], disciplina: string }> = {};

  // 1. Processar Avaliações (Notas)
  const notasFiltradas = bimestreSelecionado 
    ? aluno.notas.filter(n => n.bimestre === bimestreSelecionado)
    : aluno.notas;

  for (const nota of notasFiltradas) {
    const discNome = nota.disciplina.nome_disciplina;
    [
      { habs: nota.habilidades1, v: nota.nota1 },
      { habs: nota.habilidades2, v: nota.nota2 }
    ].forEach(item => {
      item.habs?.forEach(habId => {
        if (!consolidado[habId]) {
          consolidado[habId] = { avaliacoes: [], atividades: [], disciplina: discNome };
        }
        consolidado[habId].avaliacoes.push(Number(item.v));
      });
    });
  }

  // 2. Processar Atividades
  const atividadesFiltradas = (aluno.turma?.atividades || []).filter(a => 
    !bimestreSelecionado || a.bimestre === bimestreSelecionado
  );

  for (const atividade of atividadesFiltradas) {
    const discNome = atividade.disciplina?.nome_disciplina || 'Geral';
    const habsAtividade = new Set<string>();
    
    atividade.questoes?.forEach(q => {
      if ((q as any).habilidadeId) habsAtividade.add((q as any).habilidadeId);
    });

    habsAtividade.forEach(habId => {
      if (!consolidado[habId]) {
        consolidado[habId] = { avaliacoes: [], atividades: [], disciplina: discNome };
      }
      consolidado[habId].atividades.push(Number(atividade.valor || 0));
    });
  }

  const idsUnicos = Object.keys(consolidado);
  if (idsUnicos.length === 0) return [];

  // 3. Buscar nomes das habilidades para o retorno
  const habilidadesCadastradas = await this.dataSource.getRepository(Habilidade).find({
    where: { id: In(idsUnicos) }
  });
  const mapaNomes = new Map(habilidadesCadastradas.map(h => [h.id, h.nome]));

  // 4. Calcular a Média Ponderada (50% Prova / 50% Atividade)
  const listaComMedia = Object.entries(consolidado).map(([id, dados]) => {
    const mAvaliacao = dados.avaliacoes.length > 0 
      ? dados.avaliacoes.reduce((a, b) => a + b, 0) / dados.avaliacoes.length 
      : null;

    const mAtividade = dados.atividades.length > 0 
      ? dados.atividades.reduce((a, b) => a + b, 0) / dados.atividades.length 
      : null;

    let mediaFinal = 0;
    if (mAvaliacao !== null && mAtividade !== null) {
      mediaFinal = (mAvaliacao + mAtividade) / 2;
    } else {
      mediaFinal = mAvaliacao ?? mAtividade ?? 0;
    }

    return {
      habilidade: mapaNomes.get(id) || id,
      disciplina: dados.disciplina,
      mediaFinal
    };
  });

  // 5. Ordenar pelas MENORES médias e retornar as 3 primeiras
  return listaComMedia
    .sort((a, b) => a.mediaFinal - b.mediaFinal)
    .slice(0, 3)
    .map(item => ({
      habilidade: item.habilidade,
      disciplina: item.disciplina
    }));
}

async getDesempenhoPorDisciplina(usuarioId: string, bimestre?: number) {
  const aluno = await this.alunoRepository.findOne({
    where: { usuario: { id: usuarioId } },
    relations: ['notas', 'notas.disciplina'],
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
    ? aluno.notas.filter(n => n.bimestre === bimestreSelecionado)
    : aluno.notas;

  const mapa: Record<string, number[]> = {};

  notasFiltradas.forEach(nota => {
    const nome = nota.disciplina.nome_disciplina;
    mapa[nome] ??= [];
    mapa[nome].push(Number(nota.nota1), Number(nota.nota2));
  });

  return Object.entries(mapa).map(([disciplina, notas]) => ({
    disciplina,
    media: Number((notas.reduce((s, n) => s + n, 0) / notas.length).toFixed(2)),
  }));
}

}

