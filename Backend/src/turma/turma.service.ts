import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Turma } from './entities/turma.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Professor } from '../professor/entities/professor.entity';

@Injectable()
export class TurmaService {
  constructor(
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,

    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>,

    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,
  ) {}

  private async loadAlunos(alunosIds?: string[]): Promise<Aluno[]> {
    if (!alunosIds || alunosIds.length === 0) return [];

    const alunos = await this.alunoRepository.find({ where: { id: In(alunosIds) } });

    if (alunos.length !== alunosIds.length)
      throw new NotFoundException('Um ou mais alunos não foram encontrados');

    return alunos;
  }

  private async loadDisciplinas(disciplinasIds?: string[]): Promise<Disciplina[]> {
    if (!disciplinasIds || disciplinasIds.length === 0) return [];

    const disciplinas = await this.disciplinaRepository.find({
      where: { id_disciplina: In(disciplinasIds) as any },
    });

    if (disciplinas.length !== disciplinasIds.length)
      throw new NotFoundException('Uma ou mais disciplinas não foram encontradas');

    return disciplinas;
  }

  private async loadProfessor(professorId?: string): Promise<Professor | undefined> {
    if (!professorId) return undefined;

    const professor = await this.professorRepository.findOne({ where: { id: professorId } });
    if (!professor) throw new NotFoundException('Professor não encontrado');
    return professor;
  }

  private async validarConflitoProfessor(
    professorId: string,
    turno: string,
    ano_letivo: string,
    turmaId?: string,
  ): Promise<void> {
    const query = this.turmaRepository
      .createQueryBuilder('turma')
      .leftJoin('turma.professor', 'professor')
      .where('professor.id = :professorId', { professorId })
      .andWhere('turma.turno = :turno', { turno })
      .andWhere('turma.ano_letivo = :ano_letivo', { ano_letivo })
      .andWhere('turma.ativa = true');

    if (turmaId) {
      query.andWhere('turma.id != :turmaId', { turmaId });
    }

    const conflito = await query.getOne();
    if (conflito)
      throw new BadRequestException(
        'O professor já possui uma turma ativa neste turno e ano letivo',
      );
  }

  async create(dto: CreateTurmaDto): Promise<Turma> {
    if (dto.professorId) {
      await this.validarConflitoProfessor(dto.professorId, dto.turno, dto.anoLetivo);
    }

    const turma = this.turmaRepository.create({
      nome_turma: dto.nome_turma,
      capacidade_maxima: dto.capacidade_maxima,
      ano_letivo: dto.anoLetivo,
      turno: dto.turno,
      ativa: dto.ativa ?? true,
    });

    turma.professor = await this.loadProfessor(dto.professorId);
    turma.alunos = await this.loadAlunos(dto.alunosIds);
    turma.disciplinas = await this.loadDisciplinas(dto.disciplinasIds);

    if (turma.capacidade_maxima && turma.alunos.length > turma.capacidade_maxima) {
      throw new BadRequestException(
        'Número de alunos excede a capacidade máxima da turma',
      );
    }

    return this.turmaRepository.save(turma);
  }

  async findAll(): Promise<Turma[]> {
    return this.turmaRepository.find({
      relations: ['alunos', 'disciplinas', 'professor', 'avisos'],
      order: { nome_turma: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Turma> {
    const turma = await this.turmaRepository.findOne({
      where: { id },
      relations: ['alunos', 'disciplinas', 'professor', 'avisos'],
    });

    if (!turma) throw new NotFoundException('Turma não encontrada');
    return turma;
  }

  async update(id: string, dto: UpdateTurmaDto): Promise<Turma> {
    const turma = await this.findOne(id);

    if (!turma.ativa && dto.ativa === undefined) {
      throw new BadRequestException('Turma inativa não pode ser alterada');
    }

    const professorId = dto.professorId ?? turma.professor?.id;
    const turno = dto.turno ?? turma.turno;
    const ano_letivo = dto.anoLetivo ?? turma.ano_letivo;

    if (professorId) {
      await this.validarConflitoProfessor(professorId, turno, ano_letivo, turma.id);
    }

    turma.nome_turma = dto.nome_turma ?? turma.nome_turma;
    turma.capacidade_maxima = dto.capacidade_maxima ?? turma.capacidade_maxima;
    turma.ano_letivo = dto.anoLetivo ?? turma.ano_letivo;
    turma.turno = dto.turno ?? turma.turno;
    turma.ativa = dto.ativa ?? turma.ativa;

    if (dto.professorId !== undefined) {
      turma.professor = dto.professorId
        ? await this.loadProfessor(dto.professorId)
        : undefined;
    }

    if (dto.alunosIds !== undefined) {
      turma.alunos = await this.loadAlunos(dto.alunosIds);
    }

    if (dto.disciplinasIds !== undefined) {
      turma.disciplinas = await this.loadDisciplinas(dto.disciplinasIds);
    }

    if (turma.capacidade_maxima && turma.alunos.length > turma.capacidade_maxima) {
      throw new BadRequestException(
        'Número de alunos excede a capacidade máxima da turma',
      );
    }

    return this.turmaRepository.save(turma);
  }

  async addAluno(turmaId: string, alunoId: string): Promise<Turma> {
    const turma = await this.findOne(turmaId);

    if (!turma.ativa) throw new BadRequestException('Não é possível adicionar aluno em turma inativa');

    const aluno = await this.alunoRepository.findOne({ where: { id: alunoId } });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    if (turma.alunos.some(a => a.id === aluno.id))
      throw new BadRequestException('Aluno já está matriculado na turma');

    if (turma.capacidade_maxima && turma.alunos.length + 1 > turma.capacidade_maxima)
      throw new BadRequestException('Capacidade máxima da turma atingida');

    turma.alunos.push(aluno);
    return this.turmaRepository.save(turma);
  }

  async removeAluno(turmaId: string, alunoId: string): Promise<Turma> {
    const turma = await this.findOne(turmaId);

    if (!turma.ativa) throw new BadRequestException('Não é possível remover aluno de turma inativa');

    turma.alunos = turma.alunos.filter(a => a.id !== alunoId);
    return this.turmaRepository.save(turma);
  }

  async definirProfessor(turmaId: string, professorId: string): Promise<Turma> {
    const turma = await this.findOne(turmaId);

    if (!turma.ativa) throw new BadRequestException('Não é possível definir professor em turma inativa');

    await this.validarConflitoProfessor(professorId, turma.turno, turma.ano_letivo, turma.id);
    turma.professor = await this.loadProfessor(professorId);
    return this.turmaRepository.save(turma);
  }

  async removerProfessor(turmaId: string): Promise<Turma> {
    const turma = await this.findOne(turmaId);

    if (!turma.ativa) throw new BadRequestException('Não é possível remover professor de turma inativa');

    turma.professor = undefined;
    return this.turmaRepository.save(turma);
  }

  async toggleAtiva(id: string, ativa: boolean): Promise<Turma> {
    const turma = await this.findOne(id);
    turma.ativa = ativa;
    return this.turmaRepository.save(turma);
  }

  async remove(id: string): Promise<void> {
    const turma = await this.findOne(id);
    await this.turmaRepository.remove(turma);
  }
}
