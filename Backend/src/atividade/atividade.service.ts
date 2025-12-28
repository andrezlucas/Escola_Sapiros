import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Atividade } from './entities/atividade.entity';
import { Questao } from './entities/questao.entity';
import { Alternativa } from './entities/alternativa.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';

@Injectable()
export class AtividadeService {
  private readonly logger = new Logger(AtividadeService.name);

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
  ) { }

  async create(createAtividadeDto: CreateAtividadeDto) {
    return this.atividadeRepository.manager.transaction(async (manager) => {
      try {
        this.logger.log(`Criando nova atividade: ${createAtividadeDto.titulo}`);

        // Valida se a disciplina existe
        const disciplina = await this.disciplinaRepository.findOne({
          where: { id_disciplina: createAtividadeDto.disciplinaId }
        });
        if (!disciplina) {
          throw new NotFoundException(`Disciplina com ID ${createAtividadeDto.disciplinaId} não encontrada`);
        }

        // Valida se as turmas existem
        if (createAtividadeDto.turmaIds?.length > 0) {
          const turmas = await this.turmaRepository.findByIds(createAtividadeDto.turmaIds);
          if (turmas.length !== createAtividadeDto.turmaIds.length) {
            throw new NotFoundException('Uma ou mais turmas não foram encontradas');
          }
        }

        // Cria a atividade
        const atividade = manager.create(Atividade, {
          titulo: createAtividadeDto.titulo,
          descricao: createAtividadeDto.descricao,
          dataEntrega: new Date(createAtividadeDto.dataEntrega),
          valor: createAtividadeDto.valor,
          ativa: createAtividadeDto.ativa ?? true,
          disciplina: { id_disciplina: createAtividadeDto.disciplinaId },  
        });

        const atividadeSalva = await manager.save(atividade);

        // Associa as turmas
        if (createAtividadeDto.turmaIds?.length > 0) {
          await manager
            .createQueryBuilder()
            .relation(Atividade, 'turmas')
            .of(atividadeSalva.id)
            .add(createAtividadeDto.turmaIds);
        }

        // Cria as questões e alternativas
        if (createAtividadeDto.questoes?.length > 0) {
          for (const [index, questaoDto] of createAtividadeDto.questoes.entries()) {
            const questao = manager.create(Questao, {
              ...questaoDto,
              ordem: index + 1,
              atividade: { id: atividadeSalva.id },
            });

            const questaoSalva = await manager.save(questao);

            if (questaoDto.alternativas?.length > 0) {
              const alternativas = questaoDto.alternativas.map((alt, altIndex) =>
                manager.create(Alternativa, {
                  ...alt,
                  letra: alt.letra || String.fromCharCode(65 + altIndex),
                  questao: { id: questaoSalva.id },
                }),
              );
              await manager.save(alternativas);
            }
          }
        }

        return this.findOne(atividadeSalva.id);
      } catch (erro) {
        this.logger.error(`Erro ao criar atividade: ${erro.message}`, erro.stack);
        throw erro;
      }
    });
  }

  async findAll(pagina: number = 1, limite: number = 10) {
    this.logger.log(`Buscando atividades - Página ${pagina}, Limite ${limite}`);

    const [resultado, total] = await this.atividadeRepository.findAndCount({
      take: limite,
      skip: (pagina - 1) * limite,
      relations: ['questoes', 'questoes.alternativas', 'disciplina', 'turmas'],
      order: { criadoem: 'DESC' },
    });

    return {
      dados: resultado,
      total,
      pagina,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async findOne(id: string) {
    this.logger.log(`Buscando atividade com ID: ${id}`);

    const atividade = await this.atividadeRepository.findOne({
      where: { id },
      relations: ['questoes', 'questoes.alternativas', 'disciplina', 'turmas'],
    });

    if (!atividade) {
      throw new NotFoundException(`Atividade com ID ${id} não encontrada`);
    }

    return atividade;
  }

  async update(id: string, updateAtividadeDto: UpdateAtividadeDto) {
    return this.atividadeRepository.manager.transaction(async (manager) => {
      try {
        this.logger.log(`Atualizando atividade com ID: ${id}`);

        const atividadeExistente = await this.atividadeRepository.findOne({
          where: { id },
          select: ['id', 'versao'],
        });

        if (!atividadeExistente) {
          throw new NotFoundException(`Atividade com ID ${id} não encontrada`);
        }

        if (updateAtividadeDto.versao !== atividadeExistente.versao) {
          throw new ConflictException('A atividade foi modificada por outro usuário. Por favor, atualize a página e tente novamente.');
        }
const atividade = await manager.preload(Atividade, {
  id,
  ...updateAtividadeDto,
});

if (updateAtividadeDto.turmaIds) {
  const turmas = await this.turmaRepository.findByIds(updateAtividadeDto.turmaIds);
  if (turmas.length !== updateAtividadeDto.turmaIds.length) {
    throw new NotFoundException('Uma ou mais turmas não foram encontradas');
  }

  // Busca a atividade com as turmas atuais
  const atividadeComTurmas = await this.atividadeRepository.findOne({
    where: { id },
    relations: ['turmas']
  });

  if (!atividadeComTurmas) {
    throw new NotFoundException(`Atividade com ID ${id} não encontrada`);
  }

  // Extrai os IDs das turmas atuais
  const turmasAtuais = atividadeComTurmas.turmas?.map(t => t.id) || [];

  // Atualiza as turmas
  await manager
    .createQueryBuilder()
    .relation(Atividade, 'turmas')
    .of(id)
    .addAndRemove(updateAtividadeDto.turmaIds, turmasAtuais);
}

const atividadeAtualizada = await manager.save(atividade);
return this.findOne(id);
      } catch (erro) {
        this.logger.error(`Erro ao atualizar atividade ${id}: ${erro.message}`, erro.stack);
        throw erro;
      }
    });
  }

  async remove(id: string) {
    const atividade = await this.findOne(id);
    if (!atividade) {
      throw new NotFoundException(`Atividade com ID ${id} não encontrada`);
    }

    try {
      this.logger.log(`Removendo atividade com ID: ${id}`);
      await this.atividadeRepository.remove(atividade);
      return { message: 'Atividade removida com sucesso' };
    } catch (erro) {
      this.logger.error(`Erro ao remover atividade ${id}: ${erro.message}`, erro.stack);
      throw erro;
    }
  }

  async findQuestao(atividadeId: string, questaoId: string) {
    const questao = await this.questaoRepository.findOne({
      where: {
        id: questaoId,
        atividade: { id: atividadeId }
      },
      relations: ['alternativas'],
    });

    if (!questao) {
      throw new NotFoundException(
        `Questão com ID ${questaoId} não encontrada na atividade ${atividadeId}`
      );
    }

    return questao;
  }

  // Método auxiliar para buscar atividades por disciplina
  async findByDisciplina(disciplinaId: string) {
  return this.atividadeRepository.find({
    where: { 
      disciplina: { id_disciplina: disciplinaId }  
    },
    relations: ['questoes', 'turmas'],
    order: { dataEntrega: 'ASC' },
  });
}

  // Método auxiliar para buscar atividades por turma
  async findByTurma(turmaId: string) {
    return this.atividadeRepository
      .createQueryBuilder('atividade')
      .innerJoin('atividade.turmas', 'turma', 'turma.id = :turmaId', { turmaId })
      .leftJoinAndSelect('atividade.questoes', 'questao')
      .leftJoinAndSelect('atividade.disciplina', 'disciplina')
      .orderBy('atividade.dataEntrega', 'ASC')
      .getMany();
  }
}