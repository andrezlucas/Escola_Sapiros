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
    return this.notaRepository
      .createQueryBuilder('n')
      .innerJoin('n.disciplina', 'd')
      .select('d.id_disciplina', 'disciplinaId')
      .addSelect('d.nome_disciplina', 'disciplina')
      .addSelect('AVG((n.nota_1 + n.nota_2) / 2)', 'media')
      .where('n.aluno_id = :alunoId', { alunoId })
      .groupBy('d.id_disciplina')
      .orderBy('media', 'DESC')
      .limit(1)
      .getRawOne();
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
}


