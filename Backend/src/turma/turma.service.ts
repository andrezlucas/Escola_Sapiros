import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Turma } from './entities/turma.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class TurmaService {
  constructor(
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,

    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,
  ) {}

  private validarUsuarioBloqueado(
    usuario: Usuario,
    tipo: 'Aluno' | 'Professor',
  ) {
    if (usuario.isBlocked) {
      throw new ForbiddenException(
        `${tipo} ${usuario.nome} está bloqueado(a)`,
      );
    }
  }

  private async loadAlunos(alunosIds?: string[]): Promise<Aluno[]> {
    if (!alunosIds || alunosIds.length === 0) return [];

    const alunos = await this.alunoRepository.find({
      where: { id: In(alunosIds) },
      relations: ['usuario', 'turma'],
    });

    if (alunos.length !== alunosIds.length) {
      throw new NotFoundException('Um ou mais alunos não foram encontrados');
    }

    alunos.forEach(aluno =>
      this.validarUsuarioBloqueado(aluno.usuario, 'Aluno'),
    );

    return alunos;
  }

  private async loadProfessor(
    professorId?: string,
  ): Promise<Professor | undefined> {
    if (!professorId) return undefined;

    const professor = await this.professorRepository.findOne({
      where: { id: professorId },
      relations: ['usuario'],
    });

    if (!professor) {
      throw new NotFoundException('Professor não encontrado');
    }

    this.validarUsuarioBloqueado(professor.usuario, 'Professor');

    return professor;
  }

  private async validarConflitoProfessor(
    professorId: string,
    turno: string,
    anoLetivo: string,
    turmaId?: string,
  ): Promise<void> {
    const query = this.turmaRepository
      .createQueryBuilder('turma')
      .leftJoin('turma.professor', 'professor')
      .where('professor.id = :professorId', { professorId })
      .andWhere('turma.turno = :turno', { turno })
      .andWhere('turma.ano_letivo = :anoLetivo', { anoLetivo })
      .andWhere('turma.ativa = true');

    if (turmaId) {
      query.andWhere('turma.id != :turmaId', { turmaId });
    }

    const conflito = await query.getOne();

    if (conflito) {
      throw new BadRequestException(
        'O professor já possui uma turma ativa neste turno e ano letivo',
      );
    }
  }

  async create(dto: CreateTurmaDto): Promise<Turma> {
    if (dto.professorId) {
      await this.validarConflitoProfessor(
        dto.professorId,
        dto.turno,
        dto.anoLetivo,
      );
    }

    const turma = this.turmaRepository.create({
      nome_turma: dto.nome_turma,
      capacidade_maxima: dto.capacidade_maxima,
      ano_letivo: dto.anoLetivo,
      turno: dto.turno,
      ativa: dto.ativa ?? true,
    });

    turma.professor = await this.loadProfessor(dto.professorId);

    const alunos = await this.loadAlunos(dto.alunosIds);

    for (const aluno of alunos) {
      if (aluno.turma) {
        throw new BadRequestException(
          `Aluno ${aluno.usuario.nome} já está matriculado em outra turma`,
        );
      }
    }

    const turmaSalva = await this.turmaRepository.save(turma);

    for (const aluno of alunos) {
      aluno.turma = turmaSalva;
      await this.alunoRepository.save(aluno);
    }

    return this.findOne(turmaSalva.id);
  }

  async findAll(): Promise<Turma[]> {
    return this.turmaRepository.find({
      relations: [
        'alunos',
        'alunos.usuario',
        'professor',
        'professor.usuario',
        'avisos',
      ],
      order: { nome_turma: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Turma> {
    const turma = await this.turmaRepository.findOne({
      where: { id },
      relations: [
        'alunos',
        'alunos.usuario',
        'professor',
        'professor.usuario',
        'avisos',
      ],
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    return turma;
  }

  async update(id: string, dto: UpdateTurmaDto): Promise<Turma> {
    const turma = await this.findOne(id);

    const professorId = dto.professorId ?? turma.professor?.id;
    const turno = dto.turno ?? turma.turno;
    const anoLetivo = dto.anoLetivo ?? turma.ano_letivo;

    if (professorId) {
      await this.validarConflitoProfessor(
        professorId,
        turno,
        anoLetivo,
        turma.id,
      );
    }

    turma.nome_turma = dto.nome_turma ?? turma.nome_turma;
    turma.capacidade_maxima =
      dto.capacidade_maxima ?? turma.capacidade_maxima;
    turma.turno = turno;
    turma.ano_letivo = anoLetivo;
    turma.ativa = dto.ativa ?? turma.ativa;

    if (dto.professorId !== undefined) {
      turma.professor = dto.professorId
        ? await this.loadProfessor(dto.professorId)
        : undefined;
    }

    if (dto.alunosIds !== undefined) {
      const alunos = await this.loadAlunos(dto.alunosIds);

      for (const aluno of alunos) {
        if (aluno.turma && aluno.turma.id !== turma.id) {
          throw new BadRequestException(
            `Aluno ${aluno.usuario.nome} já está em outra turma`,
          );
        }
      }

      for (const aluno of alunos) {
        aluno.turma = turma;
        await this.alunoRepository.save(aluno);
      }
    }

    return this.findOne(turma.id);
  }

  async toggleAtiva(id: string, ativa: boolean): Promise<Turma> {
    const turma = await this.findOne(id);
    turma.ativa = ativa;
    return this.turmaRepository.save(turma);
  }

  async addAluno(turmaId: string, alunoId: string): Promise<Turma> {
    const turma = await this.findOne(turmaId);

    if (!turma.ativa) {
      throw new BadRequestException('Turma inativa');
    }

    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
      relations: ['usuario', 'turma'],
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    this.validarUsuarioBloqueado(aluno.usuario, 'Aluno');

    if (aluno.turma) {
      throw new BadRequestException(
        'Este aluno já está matriculado em outra turma',
      );
    }

    if (
      turma.capacidade_maxima &&
      turma.alunos.length + 1 > turma.capacidade_maxima
    ) {
      throw new BadRequestException('Capacidade máxima atingida');
    }

    aluno.turma = turma;
    await this.alunoRepository.save(aluno);

    return this.findOne(turmaId);
  }

  async removeAluno(turmaId: string, alunoId: string): Promise<Turma> {
    const aluno = await this.alunoRepository.findOne({
      where: { id: alunoId },
      relations: ['turma'],
    });

    if (!aluno || aluno.turma?.id !== turmaId) {
      throw new NotFoundException('Aluno não pertence a esta turma');
    }

    aluno.turma = undefined;
    await this.alunoRepository.save(aluno);

    return this.findOne(turmaId);
  }

  async definirProfessor(
    turmaId: string,
    professorId: string,
  ): Promise<Turma> {
    const turma = await this.findOne(turmaId);

    await this.validarConflitoProfessor(
      professorId,
      turma.turno,
      turma.ano_letivo,
      turma.id,
    );

    turma.professor = await this.loadProfessor(professorId);
    return this.turmaRepository.save(turma);
  }

  async removerProfessor(turmaId: string): Promise<Turma> {
    const turma = await this.findOne(turmaId);
    turma.professor = undefined;
    return this.turmaRepository.save(turma);
  }

  async remove(id: string): Promise<void> {
    const turma = await this.findOne(id);
    await this.turmaRepository.remove(turma);
  }
}
