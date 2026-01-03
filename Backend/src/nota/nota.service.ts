import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Nota, NotaStatus } from './entities/nota.entity';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { FilterNotaDto } from './dto/filter-nota.dto';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Usuario, Role } from '../usuario/entities/usuario.entity';

@Injectable()
export class NotaService {
  constructor(
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,
    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  private async findAlunoByMatricula(matricula: string): Promise<Aluno> {
    const aluno = await this.alunoRepository.findOne({
      where: { matriculaAluno: matricula },
    });
    if (!aluno) throw new NotFoundException(`Aluno ${matricula} não encontrado`);
    return aluno;
  }

  private async findDisciplinaById(id: string): Promise<Disciplina> {
    const disciplina = await this.disciplinaRepository.findOne({
      where: { id_disciplina: id },
    });
    if (!disciplina) throw new NotFoundException(`Disciplina ${id} não encontrada`);
    return disciplina;
  }

  private async findProfessorByUsuarioId(usuarioId: string): Promise<Professor | null> {
    return this.professorRepository.findOne({
      where: { usuario: { id: usuarioId } as any },
      relations: ['turmas', 'turmas.disciplinas'],
    });
  }

  private async professorMinistraDisciplina(professor: Professor, disciplinaId: string): Promise<boolean> {
    if (!professor) return false;
    for (const t of professor.turmas || []) {
      if (t.disciplinas?.some(d => d.id_disciplina === disciplinaId)) return true;
      const turmaFull = await this.turmaRepository.findOne({
        where: { id: t.id },
        relations: ['disciplinas'],
      });
      if (turmaFull?.disciplinas?.some(d => d.id_disciplina === disciplinaId)) return true;
    }
    return false;
  }

  private async assertCanReadNota(nota: Nota, user: any): Promise<void> {
    if (!user) throw new ForbiddenException();
    if (user.role === Role.COORDENACAO) return;
    if (user.role === Role.PROFESSOR) {
      const professor = await this.findProfessorByUsuarioId(user.id);
      if (!professor || !(await this.professorMinistraDisciplina(professor, nota.disciplina.id_disciplina))) {
        throw new ForbiddenException();
      }
      return;
    }
    if (user.role === Role.ALUNO) {
      if (nota.aluno?.matriculaAluno !== user.matricula_aluno) throw new ForbiddenException();
      return;
    }
    throw new ForbiddenException();
  }

  private async assertCanModifyNota(nota: Nota | null, user: any, disciplinaIdForCreate?: string): Promise<void> {
    if (!user) throw new ForbiddenException();
    if (user.role === Role.COORDENACAO) return;
    if (user.role === Role.PROFESSOR) {
      const professor = await this.findProfessorByUsuarioId(user.id);
      if (!professor) throw new ForbiddenException();
      const discId = nota ? nota.disciplina.id_disciplina : disciplinaIdForCreate;
      if (!discId || !(await this.professorMinistraDisciplina(professor, discId))) {
        throw new ForbiddenException();
      }
      return;
    }
    throw new ForbiddenException();
  }

  async create(createNotaDto: CreateNotaDto, user: any): Promise<Nota> {
    const { matriculaAluno, disciplinaId, valor, tipoAvaliacao, data, feedback, habilidades, status, avaliacaoNome } = createNotaDto;
    await this.assertCanModifyNota(null, user, disciplinaId);
    const aluno = await this.findAlunoByMatricula(matriculaAluno);
    const disciplina = await this.findDisciplinaById(disciplinaId);
    const nota = this.notaRepository.create({
      valor,
      tipoAvaliacao,
      avaliacaoNome,
      feedback,
      habilidades,
      status: status || NotaStatus.PENDENTE,
      data: new Date(data),
      aluno,
      disciplina,
    });
    return this.notaRepository.save(nota);
  }

  async saveBulk(notasDto: CreateNotaDto[], user: any): Promise<Nota[]> {
    const results: Nota[] = [];
    for (const dto of notasDto) {
      results.push(await this.create(dto, user));
    }
    return results;
  }

  async findAll(filters: FilterNotaDto | undefined, user: any): Promise<Nota[]> {
    const qb = this.notaRepository
      .createQueryBuilder('nota')
      .leftJoinAndSelect('nota.aluno', 'aluno')
      .leftJoinAndSelect('nota.disciplina', 'disciplina')
      .orderBy('nota.data', 'DESC');

    if (filters?.alunoId) qb.andWhere('aluno.matricula_aluno = :alunoId', { alunoId: filters.alunoId });
    if (filters?.disciplinaId) qb.andWhere('disciplina.id_disciplina = :disciplinaId', { disciplinaId: filters.disciplinaId });
    if (filters?.avaliacaoNome) qb.andWhere('nota.avaliacaoNome = :avaliacaoNome', { avaliacaoNome: filters.avaliacaoNome });
    if (filters?.status) qb.andWhere('nota.status = :status', { status: filters.status });
    if (filters?.dataInicio) qb.andWhere('nota.data >= :dataInicio', { dataInicio: filters.dataInicio });
    if (filters?.dataFim) qb.andWhere('nota.data <= :dataFim', { dataFim: filters.dataFim });

    if (!user) throw new ForbiddenException();
    if (user.role === Role.ALUNO) {
      qb.andWhere('aluno.matricula_aluno = :mat', { mat: user.matricula_aluno });
    } else if (user.role === Role.PROFESSOR) {
      const professor = await this.findProfessorByUsuarioId(user.id);
      if (!professor) return [];
      const turmas = await this.turmaRepository.find({
        where: { professor: { id_professor: professor.id } as any },
        relations: ['disciplinas'],
      });
      const ids = turmas.flatMap(t => (t.disciplinas || []).map(d => d.id_disciplina));
      if (ids.length === 0) return [];
      qb.andWhere('disciplina.id_disciplina IN (:...ids)', { ids });
    }
    return qb.getMany();
  }

  async findOne(id: string, user: any): Promise<Nota> {
    const nota = await this.notaRepository.findOne({
      where: { id },
      relations: ['aluno', 'disciplina'],
    });
    if (!nota) throw new NotFoundException();
    await this.assertCanReadNota(nota, user);
    return nota;
  }

  async update(id: string, updateNotaDto: UpdateNotaDto, user: any): Promise<Nota> {
    const nota = await this.notaRepository.findOne({
      where: { id },
      relations: ['aluno', 'disciplina'],
    });
    if (!nota) throw new NotFoundException();
    await this.assertCanModifyNota(nota, user);
    
    Object.assign(nota, {
      ...updateNotaDto,
      data: updateNotaDto.data ? new Date(updateNotaDto.data) : nota.data
    });

    if (user.role === Role.COORDENACAO) {
      if (updateNotaDto.matriculaAluno) nota.aluno = await this.findAlunoByMatricula(updateNotaDto.matriculaAluno);
      if (updateNotaDto.disciplinaId) nota.disciplina = await this.findDisciplinaById(updateNotaDto.disciplinaId);
    }
    return this.notaRepository.save(nota);
  }

  async remove(id: string, user: any): Promise<void> {
    const nota = await this.findOne(id, user);
    await this.assertCanModifyNota(nota, user);
    await this.notaRepository.remove(nota);
  }
}