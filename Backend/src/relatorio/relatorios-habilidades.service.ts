import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RespostaQuestao } from '../atividade/entities/resposta-questao.entity';

@Injectable()
export class RelatoriosHabilidadesService {
  constructor(
    @InjectRepository(RespostaQuestao)
    private readonly respostaRepo: Repository<RespostaQuestao>,
  ) {}

  async listarPorHabilidade(filtros: any) {
    const { disciplinaId, bimestre, turmaId } = filtros;

    const qb = this.respostaRepo
      .createQueryBuilder('rq')
      .innerJoin('rq.questao', 'q')
      .innerJoin('q.habilidades', 'h')
      .innerJoin('rq.entrega', 'e')
      .innerJoin('e.atividade', 'atv')
      .innerJoin('atv.disciplina', 'd')
      .where('d.id = :disciplinaId', { disciplinaId })
      .andWhere('atv.bimestre = :bimestre', { bimestre });

    if (turmaId) {
      qb.innerJoin('e.aluno', 'a')
        .innerJoin('a.turma', 't')
        .andWhere('t.id = :turmaId', { turmaId });
    }

    const dados = await qb
      .select('h.id', 'habilidadeId')
      .addSelect('h.nome', 'habilidade')
      .addSelect('h.descricao', 'descricao')
      .addSelect(
        'ROUND((SUM(rq.notaAtribuida) * 100.0) / NULLIF(SUM(q.valor), 0), 0)',
        'percentual',
      )
      .groupBy('h.id')
      .addGroupBy('h.nome')
      .addGroupBy('h.descricao')
      .orderBy('percentual', 'ASC')
      .getRawMany();

    return dados.map(d => {
      const p = Number(d.percentual) || 0;
      return {
        habilidadeId: d.habilidadeId,
        habilidade: d.habilidade,
        descricao: d.descricao,
        percentual: p,
        cor: p < 40 ? '#E15554' : p < 70 ? '#E19554' : '#3BB273',
      };
    });
  }

  async comparativoPorTurma(filtros: any) {
    const { disciplinaId, habilidadeId, bimestre } = filtros;

    const dados = await this.respostaRepo
      .createQueryBuilder('rq')
      .innerJoin('rq.questao', 'q')
      .innerJoin('q.habilidades', 'h')
      .innerJoin('rq.entrega', 'e')
      .innerJoin('e.atividade', 'atv')
      .innerJoin('e.aluno', 'a')
      .innerJoin('a.turma', 't')
      .innerJoin('atv.disciplina', 'd')
      .where('d.id = :disciplinaId', { disciplinaId })
      .andWhere('h.id = :habilidadeId', { habilidadeId })
      .andWhere('atv.bimestre = :bimestre', { bimestre })
      .select('t.nome_turma', 'turma')
      .addSelect(
        'ROUND((SUM(rq.notaAtribuida) * 100.0) / NULLIF(SUM(q.valor), 0), 0)',
        'percentual',
      )
      .groupBy('t.id')
      .addGroupBy('t.nome_turma')
      .orderBy('t.nome_turma', 'ASC')
      .getRawMany();

    return dados.map(d => ({
      turma: d.turma,
      percentual: Number(d.percentual) || 0,
    }));
  }
}