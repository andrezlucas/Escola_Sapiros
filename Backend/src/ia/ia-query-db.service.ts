import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { Nota } from '../nota/entities/nota.entity';
import { Atividade } from '../atividade/entities/atividade.entity';
import { Entrega } from '../atividade/entities/entrega.entity';
import { Frequencia } from '../frequencia/entities/frequencia.entity';
import { Simulado } from '../simulado/entities/simulado.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Habilidade } from '../disciplina/entities/habilidade.entity';
import { TentativaSimulado } from 'src/simulado/entities/tentativa-simulado.entity';

@Injectable()
export class IaQueryDbService {
  constructor(
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,

    @InjectRepository(Atividade)
    private readonly atividadeRepository: Repository<Atividade>,

    @InjectRepository(Entrega)
    private readonly entregaRepository: Repository<Entrega>,

    @InjectRepository(Frequencia)
    private readonly frequenciaRepository: Repository<Frequencia>,

    @InjectRepository(Simulado)
    private readonly simuladoRepository: Repository<Simulado>,

    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,

    @InjectRepository(Habilidade)
    private readonly habilidadeRepository: Repository<Habilidade>,
  ) {}

  /* =====================
     MÉDIA GERAL DO ALUNO
  ====================== */
  async mediaGeral(alunoId: string) {
    const resultado = await this.notaRepository
      .createQueryBuilder('n')
      .select('AVG((n.nota1 + n.nota2) / 2)', 'media')
      .where('n.aluno = :alunoId', { alunoId })
      .getRawOne();

    return {
      media: Number(Number(resultado?.media || 0).toFixed(2)),
    };
  }

  /* =====================
     DISCIPLINA COM PIOR DESEMPENHO
  ====================== */
  async disciplinaPiorDesempenho(alunoId: string) {
    return this.notaRepository
      .createQueryBuilder('n')
      .innerJoin('n.disciplina', 'd')
      .select('d.id_disciplina', 'disciplinaId')
      .addSelect('d.nome_disciplina', 'disciplina')
      .addSelect('AVG((n.nota_1 + n.nota_2) / 2)', 'media')
      .where('n.aluno_id = :alunoId', { alunoId })
      .groupBy('d.id_disciplina')
      .orderBy('media', 'ASC')
      .getRawOne();
  }

  /* =====================
     FREQUÊNCIA POR DATA
  ====================== */
  async frequenciaPorData(alunoId: string, data: string) {
    const dataConvertida = new Date(data);

    const frequencia = await this.frequenciaRepository.findOne({
      where: {
        aluno: { id: alunoId },
        data: dataConvertida,
      },
    });

    if (!frequencia) {
      throw new NotFoundException('Frequência não encontrada para esta data');
    }

    return frequencia;
  }

  /* =====================
     ATIVIDADES PENDENTES
  ====================== */
  async atividadesPendentes(alunoId: string) {
    return this.atividadeRepository
      .createQueryBuilder('a')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(Entrega, 'e')
          .where('e.atividade_id = a.id')
          .andWhere('e.aluno_id = :alunoId')
          .getQuery();

        return `NOT EXISTS ${subQuery}`;
      })
      .setParameter('alunoId', alunoId)
      .getMany();
  }

  /* =====================
     QUANTIDADE DE SIMULADOS
  ====================== */
  async quantidadeSimulados(alunoId: string) {
    const resultado = await this.simuladoRepository
      .createQueryBuilder('s')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('COUNT(1)')
          .from(TentativaSimulado, 't')
          .where('t.simulado_id = s.id')
          .andWhere('t.aluno_id = :alunoId')
          .getQuery();

        return `${subQuery} > 0`;
      })
      .setParameter('alunoId', alunoId)
      .getCount();

    return {
      quantidade: resultado,
    };
  }

  /* =====================
     HABILIDADE / DISCIPLINA MAIS FORTE
  ====================== */
async habilidadeMaisForte(alunoId: string) {
  const melhorDisciplina = await this.notaRepository
    .createQueryBuilder('n')
    .innerJoin('n.disciplina', 'd')
    .select('d.id_disciplina', 'disciplinaId')
    .addSelect('d.nome_disciplina', 'disciplina')
    .addSelect(
      'AVG((COALESCE(n.nota_1,0) + COALESCE(n.nota_2,0)) / 2)',
      'media',
    )
    .where('n.aluno_id = :alunoId', { alunoId })
    .groupBy('d.id_disciplina')
    .addGroupBy('d.nome_disciplina')
    .orderBy('media', 'DESC')
    .limit(1)
    .getRawOne();

  if (!melhorDisciplina) return null;

  const habilidades = await this.habilidadeRepository.find({
    where: { disciplina: { id_disciplina: melhorDisciplina.disciplinaId } },
    select: ['id', 'nome', 'descricao'],
  });

  return {
    disciplina: melhorDisciplina.disciplina,
    media: Number(Number(melhorDisciplina.media).toFixed(2)),
    habilidades,
  };
}



  /* =====================
     BUSCAR ALUNO POR NOME
  ====================== */
  async buscarAlunoPorNome(nome: string) {
    return this.alunoRepository
      .createQueryBuilder('aluno')
      .innerJoinAndSelect('aluno.usuario', 'usuario')
      .where('LOWER(usuario.nome) LIKE LOWER(:nome)', {
        nome: `%${nome.split(' ')[0]}%`,
      })
      .getOne();
  }

  /* =====================
   RANKING DE DISCIPLINAS
====================== */
async rankingDisciplinas(alunoId: string) {
  return this.notaRepository
    .createQueryBuilder('n')
    .innerJoin('n.disciplina', 'd')
    .select('d.id_disciplina', 'disciplinaId')
    .addSelect('d.nome_disciplina', 'disciplina')
    .addSelect(
      'AVG((COALESCE(n.nota_1,0) + COALESCE(n.nota_2,0)) * 1.0 / 2)',
      'media',
    )
    .where('n.aluno_id = :alunoId', { alunoId })
    .groupBy('d.id_disciplina')
    .addGroupBy('d.nome_disciplina')
    .orderBy('media', 'DESC')
    .getRawMany();
}

/* =====================
   DISCIPLINAS CRÍTICAS
====================== */
async disciplinasCriticas(alunoId: string, limite = 6) {
  return this.notaRepository
    .createQueryBuilder('n')
    .innerJoin('n.disciplina', 'd')
    .select('d.id_disciplina', 'disciplinaId')
    .addSelect('d.nome_disciplina', 'disciplina')
    .addSelect(
      'AVG((COALESCE(n.nota_1,0) + COALESCE(n.nota_2,0)) * 1.0 / 2)',
      'media',
    )
    .where('n.aluno_id = :alunoId', { alunoId })
    .groupBy('d.id_disciplina')
    .addGroupBy('d.nome_disciplina')
    .having('media < :limite', { limite })
    .orderBy('media', 'ASC')
    .getRawMany();
}
/* =====================
   SCORE COGNITIVO
====================== */
async scoreCognitivo(alunoId: string) {
  const media = await this.mediaGeral(alunoId);

  const frequencia = await this.frequenciaRepository
    .createQueryBuilder('f')
    .where('f.aluno_id = :alunoId', { alunoId })
    .getCount();

  const simulados = await this.quantidadeSimulados(alunoId);

  const score =
    media.media * 0.6 +
    Math.min(frequencia, 100) * 0.2 +
    simulados.quantidade * 2 * 0.2;

  return {
    media: media.media,
    frequencia,
    simulados: simulados.quantidade,
    score: Number(score.toFixed(2)),
    classificacao:
      score >= 8
        ? 'Excelente'
        : score >= 6
        ? 'Bom'
        : score >= 4
        ? 'Regular'
        : 'Crítico',
  };
}

/* =====================
   EVOLUÇÃO TEMPORAL
====================== */
async evolucaoDesempenho(alunoId: string) {
  return this.notaRepository
    .createQueryBuilder('n')
    .select('DATE(n.criado_em)', 'data')
    .addSelect('AVG((n.nota_1 + n.nota_2) / 2)', 'media')
    .where('n.aluno_id = :alunoId', { alunoId })
    .groupBy('DATE(n.criado_em)')
    .orderBy('data', 'ASC')
    .getRawMany();
}


/* =====================
   SUGESTÃO DE REFORÇO
====================== */
async sugestaoReforco(alunoId: string) {
  const ranking = await this.rankingDisciplinas(alunoId);
  const fracas = await this.disciplinasCriticas(alunoId);

  if (!ranking.length) {
    return {
      status: 'sem_dados',
      mensagem: 'Ainda não há dados suficientes para gerar um plano pedagógico.',
    };
  }

  // Caso crítico
  if (fracas.length) {
    return {
      status: 'reforco',
      mensagem: `Recomenda-se reforço prioritário nas disciplinas: ${fracas
        .map((d) => d.disciplina)
        .join(', ')}.`,
      plano: fracas.map((d) => ({
        disciplina: d.disciplina,
        media: Number(d.media),
        sugestao: `Revisar conteúdos base e realizar exercícios extras em ${d.disciplina}.`,
      })),
    };
  }

  // Caso bom desempenho → plano de evolução
  return {
    status: 'excelente',
    mensagem:
      'Excelente desempenho geral! Recomenda-se um plano de manutenção e evolução contínua.',
    pontosFortes: ranking.slice(0, 3).map((d) => ({
      disciplina: d.disciplina,
      media: Number(d.media),
    })),
    plano: [
      'Manter rotina semanal de estudos',
      'Realizar simulados quinzenais',
      'Explorar conteúdos avançados nas disciplinas de maior desempenho',
      'Participar de projetos interdisciplinares',
    ],
  };
}


}




