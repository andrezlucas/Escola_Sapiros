import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nota, NotaStatus, Bimestre } from './entities/nota.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Usuario, Role } from '../usuario/entities/usuario.entity';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { FilterNotaDto } from './dto/filter-nota.dto';

@Injectable()
export class NotaService {
  constructor(
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,
  ) {}

  private async findProfessorByUsuarioId(usuarioId: string): Promise<Professor> {
    const professor = await this.professorRepository.findOne({
      where: { id: usuarioId },
      relations: ['turmas', 'disciplinas'],
    });
    if (!professor) throw new ForbiddenException('Vínculo de professor não encontrado');
    return professor;
  }

  async findTurmasByProfessor(usuarioId: string) {
    const professor = await this.findProfessorByUsuarioId(usuarioId);
    return professor.turmas;
  }

  async findDisciplinasByTurma(turmaId: string, usuarioId: string) {
    return await this.disciplinaRepository.createQueryBuilder('disciplina')
      .innerJoin('disciplina.turmas', 'turma')
      .innerJoin('disciplina.professores', 'professor')
      .where('turma.id = :turmaId', { turmaId })
      .andWhere('professor.id = :usuarioId', { usuarioId })
      .getMany();
  }

  async findAlunosParaLancamento(turmaId: string, disciplinaId: string, bimestre: Bimestre) {
    const alunos = await this.alunoRepository.find({
      where: { turma: { id: turmaId } },
      relations: ['usuario', 'notas', 'notas.disciplina'],
    });

    return alunos.map(aluno => {
      const notaExistente = aluno.notas?.find(n => 
        n.disciplina?.id_disciplina === disciplinaId && n.bimestre === bimestre
      );

      return {
        alunoId: aluno.id,
        nome: aluno.usuario?.nome,
        nota1: notaExistente ? Number(notaExistente.nota1) : 0,
        nota2: notaExistente ? Number(notaExistente.nota2) : 0,
        habilidades: notaExistente?.habilidades || [],
        feedback: notaExistente?.feedback || '',
        status: notaExistente?.status || NotaStatus.PENDENTE
      };
    });
  }

  async create(dto: CreateNotaDto, user: Usuario): Promise<Nota> {
    const professor = await this.findProfessorByUsuarioId(user.id);
    
    const aluno = await this.alunoRepository.findOne({ where: { id: dto.alunoId } });
    if (!aluno) throw new NotFoundException('Aluno não encontrado');

    const disciplina = await this.disciplinaRepository.findOne({ where: { id_disciplina: dto.disciplinaId } });
    if (!disciplina) throw new NotFoundException('Disciplina não encontrada');

    const nota = this.notaRepository.create({
      ...dto,
      aluno,
      disciplina,
      professor,
      status: dto.status || NotaStatus.SALVO
    });

    return await this.notaRepository.save(nota);
  }

  async saveBulk(notasDto: CreateNotaDto[], user: Usuario): Promise<Nota[]> {
    const professor = await this.findProfessorByUsuarioId(user.id);
    const results: Nota[] = [];

    for (const dto of notasDto) {
      let nota = await this.notaRepository.findOne({
        where: { 
          aluno: { id: dto.alunoId }, 
          disciplina: { id_disciplina: dto.disciplinaId }, 
          bimestre: dto.bimestre 
        }
      });

      if (nota) {
        Object.assign(nota, {
          nota1: dto.nota1,
          nota2: dto.nota2,
          habilidades: dto.habilidades,
          feedback: dto.feedback,
          status: NotaStatus.SALVO
        });
      } else {
        nota = this.notaRepository.create({
          ...dto,
          aluno: { id: dto.alunoId } as Aluno,
          disciplina: { id_disciplina: dto.disciplinaId } as Disciplina,
          professor,
          status: NotaStatus.SALVO
        });
      }
      results.push(await this.notaRepository.save(nota));
    }
    return results;
  }

  async findAll(filters: FilterNotaDto, user: Usuario): Promise<Nota[]> {
    const qb = this.notaRepository.createQueryBuilder('nota')
      .leftJoinAndSelect('nota.aluno', 'aluno')
      .leftJoinAndSelect('aluno.usuario', 'alunoUsuario')
      .leftJoinAndSelect('nota.disciplina', 'disciplina')
      .leftJoinAndSelect('nota.professor', 'professor');

    if (user.role === Role.ALUNO) {
      qb.andWhere('alunoUsuario.id = :userId', { userId: user.id });
    } else if (user.role === Role.PROFESSOR) {
      qb.andWhere('professor.id = :userId', { userId: user.id });
    }

    if (filters.alunoId) qb.andWhere('aluno.id = :alunoId', { alunoId: filters.alunoId });
    if (filters.disciplinaId) qb.andWhere('disciplina.id_disciplina = :disciplinaId', { disciplinaId: filters.disciplinaId });
    if (filters.bimestre) qb.andWhere('nota.bimestre = :bimestre', { bimestre: filters.bimestre });
    if (filters.status) qb.andWhere('nota.status = :status', { status: filters.status });

    return await qb.getMany();
  }

  async findOne(id: string, user: Usuario): Promise<Nota> {
    const nota = await this.notaRepository.findOne({
      where: { id },
      relations: ['aluno', 'aluno.usuario', 'disciplina', 'professor']
    });
    if (!nota) throw new NotFoundException('Nota não encontrada');
    return nota;
  }

  async update(id: string, dto: UpdateNotaDto, user: Usuario): Promise<Nota> {
    const nota = await this.findOne(id, user);
    Object.assign(nota, dto);
    return await this.notaRepository.save(nota);
  }

  async remove(id: string, user: Usuario): Promise<void> {
    const nota = await this.findOne(id, user);
    await this.notaRepository.remove(nota);
  }
}