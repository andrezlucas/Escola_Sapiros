import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { Nota } from '../nota/entities/nota.entity';
import { Atividade } from '../atividade/entities/atividade.entity';
import { Entrega } from '../atividade/entities/entrega.entity';
import { Frequencia } from '../frequencia/entities/frequencia.entity';
import { Simulado } from '../simulado/entities/simulado.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Habilidade } from '../disciplina/entities/habilidade.entity';
import { NotFoundException } from '@nestjs/common';

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
    const notas = await this.notaRepository.find({
      where: { aluno: { id: alunoId } },
    });

    if (notas.length === 0) {
      return { media: 0 };
    }

    const soma = notas.reduce(
      (total, n) => total + (Number(n.nota1) + Number(n.nota2)) / 2,
      0,
    );

    return {
      media: Number((soma / notas.length).toFixed(2)),
    };
  }

  /* =====================
     DISCIPLINA COM PIOR DESEMPENHO
  ====================== */
  async disciplinaPiorDesempenho(alunoId: string) {
    return this.notaRepository
      .createQueryBuilder('n')
      .select('d.nome', 'disciplina')
      .addSelect('AVG((n.nota1 + n.nota2) / 2)', 'media')
      .innerJoin('n.disciplina', 'd')
      .where('n.aluno_id = :alunoId', { alunoId })
      .groupBy('d.nome')
      .orderBy('media', 'ASC')
      .getRawOne();
  }

  /* =====================
     FREQUÊNCIA POR DATA
  ====================== */
  async frequenciaPorData(alunoId: string, data: string) {
    const dataConvertida = new Date(data);

    return this.frequenciaRepository.findOne({
      where: {
        aluno: { id: alunoId },
        data: dataConvertida,
      },
    });
  }

  /* =====================
     ATIVIDADES PENDENTES
  ====================== */
  async atividadesPendentes(alunoId: string) {
    return this.atividadeRepository
      .createQueryBuilder('a')
      .leftJoin(
        'a.entregas',
        'e',
        'e.aluno_id = :alunoId',
        { alunoId },
      )
      .where('e.id IS NULL')
      .getMany();
  }

  /* =====================
     QUANTIDADE DE SIMULADOS
  ====================== */
  async quantidadeSimulados(alunoId: string) {
    return this.simuladoRepository
      .createQueryBuilder('s')
      .innerJoin('s.tentativas', 't')
      .where('t.aluno_id = :alunoId', { alunoId })
      .getCount();
  }

  /* =====================
     HABILIDADE MAIS FORTE
     (nota + atividades)
  ====================== */
async habilidadeMaisForte(alunoId: string) {
  return this.notaRepository
    .createQueryBuilder('n')
    .innerJoin('n.disciplina', 'd')
    .select('d.id_disciplina', 'disciplinaId')
    .addSelect('d.nome_disciplina', 'disciplina')
    .addSelect('AVG((n.nota1 + n.nota2) / 2)', 'media')
    .where('n.aluno_id = :alunoId', { alunoId })
    .groupBy('d.id_disciplina')
    .orderBy('media', 'DESC')
    .limit(1)
    .getRawOne();
}

async disciplinaMaisForte(alunoId: string) {
  return this.notaRepository
    .createQueryBuilder('n')
    .innerJoin('n.disciplina', 'd')
    .select('d.id', 'disciplinaId')
    .addSelect('d.nome', 'disciplina')
    .addSelect('AVG((n.nota1 + n.nota2) / 2)', 'media')
    .where('n.aluno_id = :alunoId', { alunoId })
    .groupBy('d.id')
    .orderBy('media', 'DESC')
    .limit(1)
    .getRawOne();
}


async buscarAlunoPorNome(nome: string) {
  return this.alunoRepository
    .createQueryBuilder('aluno')
    .innerJoin('aluno.usuario', 'usuario')
    .where('LOWER(usuario.nome) LIKE :nome', {
      nome: `%${nome.toLowerCase()}%`,
    })
    .select([
      'aluno.id',
      'usuario.nome',
    ])
    .getOne();
}


}
