import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Atividade } from './entities/atividade.entity';
import { Questao } from './entities/questao.entity';
import { Alternativa } from './entities/alternativa.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Habilidade } from '../disciplina/entities/habilidade.entity';

import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';

@Injectable()
export class AtividadeService {
  constructor(
    @InjectRepository(Atividade)
    private atividadeRepository: Repository<Atividade>,
    @InjectRepository(Questao)
    private questaoRepository: Repository<Questao>,
    @InjectRepository(Alternativa)
    private alternativaRepository: Repository<Alternativa>,
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Turma)
    private turmaRepository: Repository<Turma>,
    @InjectRepository(Habilidade)
    private habilidadeRepository: Repository<Habilidade>,
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
      throw new ForbiddenException('Uma ou mais turmas não pertencem ao professor');
    }

    const habilidades = dto.habilidadesIds?.length
      ? await this.habilidadeRepository.find({
          where: { id: In(dto.habilidadesIds) },
        })
      : [];

    const atividade = this.atividadeRepository.create({
      titulo: dto.titulo,
      descricao: dto.descricao,
      dataEntrega: new Date(dto.dataEntrega),
      valor: dto.valor,
      ativa: dto.ativa ?? true,
      disciplina,
      turmas,
      habilidades,
    });

    const atividadeSalva = await this.atividadeRepository.save(atividade);

    for (const questaoDto of dto.questoes) {
      const questao = this.questaoRepository.create({
        enunciado: questaoDto.enunciado,
        valor: questaoDto.valor,
        tipo: questaoDto.tipo,
        atividade: atividadeSalva,
      });

      const questaoSalva = await this.questaoRepository.save(questao);

      const alternativas = questaoDto.alternativas.map((alt, index) =>
        this.alternativaRepository.create({
          texto: alt.texto,
          correta: alt.correta,
          letra: alt.letra ?? String.fromCharCode(65 + index),
          questao: questaoSalva,
        }),
      );

      await this.alternativaRepository.save(alternativas);
    }

    return this.findOne(atividadeSalva.id);
  }

  async findOne(id: string) {
    const atividade = await this.atividadeRepository.findOne({
      where: { id },
      relations: [
        'questoes',
        'questoes.alternativas',
        'disciplina',
        'turmas',
        'habilidades',
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
      .innerJoin('atividade.turmas', 'turma', 'turma.id = :turmaId', { turmaId })
      .leftJoinAndSelect('atividade.disciplina', 'disciplina')
      .leftJoinAndSelect('atividade.questoes', 'questoes')
      .orderBy('atividade.dataEntrega', 'ASC')
      .getMany();
  }

  async update(id: string, dto: UpdateAtividadeDto) {
    const atividade = await this.findOne(id);
    Object.assign(atividade, dto);
    return this.atividadeRepository.save(atividade);
  }

  async remove(id: string) {
    const atividade = await this.findOne(id);
    await this.atividadeRepository.remove(atividade);
    return { message: 'Atividade removida' };
  }
}
