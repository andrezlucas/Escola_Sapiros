import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';

import { Atividade } from './entities/atividade.entity';
import { Questao } from './entities/questao.entity';
import { Alternativa } from './entities/alternativa.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Habilidade } from '../disciplina/entities/habilidade.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Entrega } from './entities/entrega.entity';
import { RespostaQuestao } from './entities/resposta-questao.entity';
import { CriarEntregaDto } from './dto/criar-entrega.dto';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';
import { IaQuestoesService } from 'src/ia/ia-questoes.service';
import { GerarQuestoesIaDto } from './dto/gerar-questoes-ia.dto';
import { UpdateQuestaoDto } from './dto/update-questao.dto';
import { CreateQuestaoDto } from './dto/create-questao.dto';

export enum StatusAtividade {
  PENDENTE = 'PENDENTE',
  ENTREGUE = 'ENTREGUE',
  EXPIRADO = 'EXPIRADO',
}

@Injectable()
export class AtividadeService {
  constructor(
    @InjectRepository(Atividade)
    private readonly atividadeRepository: Repository<Atividade>,
    @InjectRepository(Questao)
    private readonly questaoRepository: Repository<Questao>,
    @InjectRepository(Alternativa)
    private readonly alternativaRepository: Repository<Alternativa>,
    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,
    @InjectRepository(Habilidade)
    private readonly habilidadeRepository: Repository<Habilidade>,
    private readonly dataSource: DataSource,
    private readonly iaQuestoesService: IaQuestoesService,
  ) {}

  async create(dto: CreateAtividadeDto, professorId: string) {
    const disciplina = await this.disciplinaRepository.findOne({
      where: {
        id_disciplina: dto.disciplinaId,
        professores: { id: professorId },
      },
    });

    if (!disciplina) {
      throw new ForbiddenException('Disciplina não pertence ao professor');
    }

    const turmas = await this.turmaRepository.find({
      where: {
        id: In(dto.turmaIds),
        professor: { id: professorId },
      },
    });

    if (turmas.length !== dto.turmaIds.length) {
      throw new ForbiddenException(
        'Uma ou mais turmas não pertencem ao professor',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      const atividade = manager.create(Atividade, {
        titulo: dto.titulo,
        descricao: dto.descricao,
        bimestre: dto.bimestre,
        dataEntrega: new Date(dto.dataEntrega),
        valor: dto.valor,
        ativa: dto.ativa ?? true,
        disciplina,
        turmas,
        professor: { id: professorId },
      });

      const atividadeSalva = await manager.save(atividade);

      if (dto.questoes?.length) {
        for (const questaoDto of dto.questoes) {
          const habilidades = questaoDto.habilidadesIds?.length
            ? await manager.find(Habilidade, {
                where: { id: In(questaoDto.habilidadesIds) },
              })
            : [];

          const questao = manager.create(Questao, {
            enunciado: questaoDto.enunciado,
            tipo: questaoDto.tipo,
            valor: questaoDto.valor,
            atividade: atividadeSalva,
            habilidades,
          });

          const questaoSalva = await manager.save(questao);

          if (
            questaoDto.tipo !== 'DISSERTATIVA' &&
            questaoDto.alternativas?.length
          ) {
            const alternativas = questaoDto.alternativas.map((alt, index) =>
              manager.create(Alternativa, {
                texto: alt.texto,
                correta: alt.correta,
                letra: alt.letra ?? String.fromCharCode(65 + index),
                questao: questaoSalva,
              }),
            );
            await manager.save(alternativas);
          }
        }
      }

      return manager.findOne(Atividade, {
        where: { id: atividadeSalva.id },
        relations: [
          'disciplina',
          'turmas',
          'questoes',
          'questoes.alternativas',
          'questoes.habilidades',
        ],
      });
    });
  }

  async findAllByProfessor(professorId: string) {
    return this.atividadeRepository.find({
      where: { professor: { id: professorId } },
      relations: ['disciplina', 'turmas', 'questoes'],
      order: { criadoem: 'DESC' } as any,
    });
  }

  async findOne(id: string) {
    const atividade = await this.atividadeRepository.findOne({
      where: { id },
      relations: [
        'disciplina',
        'turmas',
        'questoes',
        'questoes.alternativas',
        'questoes.habilidades',
      ],
    });

    if (!atividade) {
      throw new NotFoundException('Atividade não encontrada');
    }

    return atividade;
  }

  async findByTurma(turmaId: string) {
    return this.atividadeRepository
      .createQueryBuilder('atividade')
      .innerJoin('atividade.turmas', 'turma')
      .where('turma.id = :turmaId', { turmaId })
      .leftJoinAndSelect('atividade.disciplina', 'disciplina')
      .leftJoinAndSelect('atividade.questoes', 'questoes')
      .leftJoinAndSelect('questoes.alternativas', 'alternativas')
      .leftJoinAndSelect('questoes.habilidades', 'habilidades')
      .andWhere('atividade.ativa = :ativa', { ativa: true })
      .orderBy('atividade.dataEntrega', 'ASC')
      .getMany();
  }

  async update(id: string, dto: UpdateAtividadeDto) {
    const atividade = await this.findOne(id);
    Object.assign(atividade, dto);
    return this.atividadeRepository.save(atividade);
  }

  async partialUpdate(id: string, dto: UpdateAtividadeDto) {
    const atividade = await this.atividadeRepository.findOne({
      where: { id },
    });

    if (!atividade) {
      throw new NotFoundException('Atividade não encontrada');
    }

    if (dto.dataEntrega) {
      dto.dataEntrega = new Date(dto.dataEntrega as any);
    }

    const { questoes, ...dadosAtividade } = dto;
    this.atividadeRepository.merge(atividade, dadosAtividade);

    return this.atividadeRepository.save(atividade);
  }

  async remove(id: string) {
    const atividade = await this.findOne(id);
    await this.atividadeRepository.remove(atividade);
    return { message: 'Atividade removida com sucesso' };
  }

  private calcularNotaQuestao(
    questao: Questao,
    alternativaId?: string,
  ): number {
    if (
      (questao.tipo === 'MULTIPLA_ESCOLHA' ||
        questao.tipo === 'VERDADEIRO_FALSO') &&
      alternativaId
    ) {
      const correta = questao.alternativas.find(
        (a) => a.id === alternativaId && a.correta,
      );
      return correta ? Number(questao.valor) : 0;
    }
    return 0;
  }

  async responderAtividade(dto: CriarEntregaDto, usuarioId: string) {
    const aluno = await this.buscarTurmaDoAluno(usuarioId);

    const atividade = await this.atividadeRepository.findOne({
      where: { id: dto.atividadeId },
      relations: ['questoes', 'questoes.alternativas', 'turmas'],
    });

    if (!atividade) {
      throw new NotFoundException('Atividade não encontrada');
    }

    const agora = new Date();
    const dataLimite = new Date(atividade.dataEntrega);
    if (agora > dataLimite) {
      throw new ForbiddenException(
        'O prazo para entrega desta atividade expirou',
      );
    }

    const alunoNaTurma = atividade.turmas.some(
      (t) => t.id === aluno.turma?.id,
    );
    if (!alunoNaTurma) {
      throw new ForbiddenException(
        'Você não tem permissão para responder esta atividade',
      );
    }

    const entregaExistente = await this.dataSource
      .getRepository(Entrega)
      .findOne({
        where: { aluno: { id: aluno.id }, atividade: { id: atividade.id } },
      });
    if (entregaExistente) {
      throw new ForbiddenException('Atividade já respondida anteriormente');
    }

    return this.dataSource.transaction(async (manager) => {
      const entrega = manager.create(Entrega, {
        aluno,
        atividade,
        notaFinal: 0,
      });

      const entregaSalva = await manager.save(entrega);
      let notaAcumulada = 0;

      for (const respDto of dto.respostas) {
        const questao = atividade.questoes.find(
          (q) => q.id === respDto.questaoId,
        );
        if (!questao) continue;

        const notaQuestao = this.calcularNotaQuestao(
          questao,
          respDto.alternativaId,
        );

        const resposta = manager.create(RespostaQuestao, {
          entrega: entregaSalva,
          questao,
          alternativaEscolhida: respDto.alternativaId
            ? { id: respDto.alternativaId }
            : undefined,
          textoResposta: respDto.textoResposta,
          notaAtribuida: notaQuestao,
        });

        await manager.save(resposta);
        notaAcumulada += notaQuestao;
      }

      entregaSalva.notaFinal = notaAcumulada;
      return await manager.save(entregaSalva);
    });
  }

  async listarEntregasPorAtividade(atividadeId: string, professorId: string) {
    const atividade = await this.atividadeRepository.findOne({
      where: { id: atividadeId, professor: { id: professorId } },
    });

    if (!atividade) {
      throw new ForbiddenException(
        'Atividade não encontrada ou não pertence a este professor',
      );
    }

    return this.dataSource.getRepository(Entrega).find({
      where: { atividade: { id: atividadeId } },
      relations: [
        'aluno',
        'aluno.usuario',
        'respostas',
        'respostas.questao',
        'respostas.questao.alternativas',
        'respostas.alternativaEscolhida',
      ],
      order: { dataEntrega: 'DESC' } as any,
    });
  }

  async corrigirQuestaoDissertativa(
    entregaId: string,
    respostaId: string,
    nota: number,
    professorId: string,
  ) {
    const entrega = await this.dataSource.getRepository(Entrega).findOne({
      where: { id: entregaId, atividade: { professor: { id: professorId } } },
      relations: ['respostas'],
    });

    if (!entrega) {
      throw new ForbiddenException(
        'Entrega não encontrada ou sem permissão de acesso',
      );
    }

    const resposta = entrega.respostas.find((r) => r.id === respostaId);
    if (!resposta) {
      throw new NotFoundException('Resposta não encontrada nesta entrega');
    }

    return this.dataSource.transaction(async (manager) => {
      resposta.notaAtribuida = nota;
      await manager.save(resposta);

      const todasRespostas = await manager.find(RespostaQuestao, {
        where: { entrega: { id: entregaId } },
      });

      const novaNotaFinal = todasRespostas.reduce(
        (acc, curr) => acc + Number(curr.notaAtribuida),
        0,
      );

      await manager.update(Entrega, entregaId, { notaFinal: novaNotaFinal });

      return {
        message: 'Nota atualizada com sucesso',
        notaFinal: novaNotaFinal,
      };
    });
  }

  async listarStatusPorAluno(usuarioId: string) {
    const aluno = await this.buscarTurmaDoAluno(usuarioId);

    if (!aluno.turma) {
      throw new ForbiddenException('Aluno não vinculado a uma turma');
    }

    const atividades = await this.findByTurma(aluno.turma.id);

    const entregas = await this.dataSource.getRepository(Entrega).find({
      where: { aluno: { id: aluno.id } },
      relations: ['atividade'],
    });

    const agora = new Date();

    return atividades.map((atividade) => {
      const entrega = entregas.find((e) => e.atividade.id === atividade.id);
      const dataLimite = new Date(atividade.dataEntrega);

      let status: StatusAtividade;

      if (entrega) {
        status = StatusAtividade.ENTREGUE;
      } else if (agora > dataLimite) {
        status = StatusAtividade.EXPIRADO;
      } else {
        status = StatusAtividade.PENDENTE;
      }

      return {
        id: atividade.id,
        titulo: atividade.titulo,
        disciplina: atividade.disciplina.nome_disciplina,
        descricao: atividade.descricao,
        dataEntrega: atividade.dataEntrega,
        bimestre: atividade.bimestre,
        status,
        nota: entrega ? entrega.notaFinal : null,
      };
    });
  }

  async buscarTurmaDoAluno(usuarioId: string) {
    const aluno = await this.dataSource.getRepository(Aluno).findOne({
      where: { usuario: { id: usuarioId } },
      relations: ['turma'],
    });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');
    return aluno;
  }

  async gerarQuestoesComIa(dto: GerarQuestoesIaDto, professorId: string) {
    const disciplina = await this.disciplinaRepository.findOne({
      where: {
        id_disciplina: dto.disciplinaId,
        professores: { id: professorId },
      },
    });

    if (!disciplina) {
      throw new ForbiddenException('Disciplina não pertence ao professor');
    }

    const habilidades = dto.habilidadesIds?.length
      ? await this.habilidadeRepository.find({
          where: { id: In(dto.habilidadesIds) },
        })
      : [];

    const resultado = await this.iaQuestoesService.gerarQuestoes({
      disciplina: disciplina.nome_disciplina,
      tema: dto.tema,
      habilidades,
      quantidade: dto.quantidade,
      tipos: dto.tipos,
    });

    return {
      questoes: resultado.questoes.map((q) => ({
        enunciado: q.enunciado,
        tipo: q.tipo,
        valor: q.valor ?? 1,
        alternativas: q.alternativas ?? [],
        habilidades: habilidades.map((h) => ({
          id: h.id,
          nome: h.nome,
        })),
      })),
    };
  }

  async listarTodasEntregasDoProfessor(professorId: string) {
    return this.dataSource.getRepository(Entrega).find({
      where: {
        atividade: {
          professor: { id: professorId },
        },
      },
      relations: [
        'aluno',
        'aluno.usuario',
        'aluno.turma',
        'atividade',
        'atividade.disciplina',
      ],
      order: {
        dataEntrega: 'DESC',
      } as any,
    });
  }

  async removerQuestao(
    atividadeId: string,
    questaoId: string,
    professorId: string,
  ) {
    const atividade = await this.atividadeRepository.findOne({
      where: {
        id: atividadeId,
        professor: { id: professorId },
      },
      relations: ['questoes'],
    });

    if (!atividade) {
      throw new ForbiddenException('Atividade não encontrada');
    }

    const questao = atividade.questoes.find((q) => q.id === questaoId);

    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    await this.questaoRepository.remove(questao);

    return { message: 'Questão removida com sucesso' };
  }

  async patchQuestao(
    atividadeId: string,
    questaoId: string,
    dto: UpdateQuestaoDto,
    professorId: string,
  ) {
    const atividade = await this.atividadeRepository.findOne({
      where: {
        id: atividadeId,
        professor: { id: professorId },
      },
    });

    if (!atividade) {
      throw new ForbiddenException('Atividade não encontrada');
    }

    const questao = await this.questaoRepository.findOne({
      where: {
        id: questaoId,
        atividade: { id: atividadeId },
      },
      relations: ['alternativas', 'habilidades'],
    });

    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    return this.dataSource.transaction(async (manager) => {
      if (dto.enunciado !== undefined) questao.enunciado = dto.enunciado;
      if (dto.valor !== undefined) questao.valor = dto.valor;
      if (dto.tipo !== undefined) questao.tipo = dto.tipo;

      if (dto.habilidadesIds) {
        questao.habilidades = await manager.find(Habilidade, {
          where: { id: In(dto.habilidadesIds) },
        });
      }

      await manager.save(questao);

      if (dto.alternativas && questao.tipo !== 'DISSERTATIVA') {
        await manager.remove(questao.alternativas);

        const novasAlternativas = dto.alternativas.map((alt, index) =>
          manager.create(Alternativa, {
            texto: alt.texto,
            correta: alt.correta,
            letra: alt.letra ?? String.fromCharCode(65 + index),
            questao,
          }),
        );

        await manager.save(novasAlternativas);
      }

      return manager.findOne(Questao, {
        where: { id: questaoId },
        relations: ['alternativas', 'habilidades'],
      });
    });
  }

  async adicionarQuestao(
    atividadeId: string,
    dto: CreateQuestaoDto,
    professorId: string,
  ) {
    const atividade = await this.atividadeRepository.findOne({
      where: {
        id: atividadeId,
        professor: { id: professorId },
      },
    });

    if (!atividade) {
      throw new ForbiddenException('Atividade não encontrada');
    }

    return this.dataSource.transaction(async (manager) => {
      const habilidades = dto.habilidadesIds?.length
        ? await manager.find(Habilidade, {
            where: { id: In(dto.habilidadesIds) },
          })
        : [];

      const questao = manager.create(Questao, {
        enunciado: dto.enunciado,
        tipo: dto.tipo,
        valor: dto.valor,
        atividade,
        habilidades,
      });

      const questaoSalva = await manager.save(questao);

      if (
        dto.tipo !== 'DISSERTATIVA' &&
        dto.alternativas?.length
      ) {
        const alternativas = dto.alternativas.map((alt, index) =>
          manager.create(Alternativa, {
            texto: alt.texto,
            correta: alt.correta,
            letra: alt.letra ?? String.fromCharCode(65 + index),
            questao: questaoSalva,
          }),
        );

        await manager.save(alternativas);
      }

      return manager.findOne(Questao, {
        where: { id: questaoSalva.id },
        relations: ['alternativas', 'habilidades'],
      });
    });
  }
}