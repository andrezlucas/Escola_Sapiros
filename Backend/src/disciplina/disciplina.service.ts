import { In, Repository } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Disciplina } from './entities/disciplina.entity';
import { Habilidade } from './entities/habilidade.entity';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { CreateHabilidadeDto } from './dto/create-habilidade.dto';
import { UpdateHabilidadeDto } from './dto/update-habilidade.dto';
import { Turma } from '../turma/entities/turma.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Role } from '../usuario/entities/usuario.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class DisciplinaService {
  constructor(
    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>,

    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Habilidade)
    private readonly habilidadeRepository: Repository<Habilidade>,
  ) {}

  private async findDisciplinaOrFail(id: string): Promise<Disciplina> {
    const disciplina = await this.disciplinaRepository.findOne({
      where: { id_disciplina: id },
      relations: ['turmas', 'professores', 'habilidades'], // <-- Inclui habilidades nas relações
    });

    if (!disciplina) {
      throw new NotFoundException(`Disciplina com ID ${id} não encontrada`);
    }

    return disciplina;
  }

  private async findProfessorByUsuarioId(usuarioId: string): Promise<Professor | null> {
    return this.professorRepository.findOne({
      where: { usuario: { id: usuarioId } as any },
      relations: ['disciplinas'],
    });
  }

  private assertCanManage(user: any): void {
    if (!user || user.role !== Role.COORDENACAO) {
      throw new ForbiddenException('Apenas coordenação pode executar esta ação');
    }
  }

  async create(createDisciplinaDto: CreateDisciplinaDto, user: any): Promise<Disciplina> {
    this.assertCanManage(user);

    const { codigo_disciplina, nome_disciplina, cargaHoraria, turmasIds, professoresIds, habilidades } =
      createDisciplinaDto;

    const exists = await this.disciplinaRepository.findOne({
      where: { codigo_disciplina },
    });

    if (exists) {
      throw new BadRequestException(
        `Disciplina com código ${codigo_disciplina} já existe`,
      );
    }

    const disciplina = this.disciplinaRepository.create({
      codigo_disciplina,
      nome_disciplina,
      cargaHoraria,
    });

    if (turmasIds?.length) {
      const turmas = await this.turmaRepository.find({ where: { id: In(turmasIds) } });
      disciplina.turmas = turmas;
    }

    if (professoresIds?.length) {
      const professores = await this.professorRepository.find({ where: { id: In(professoresIds) } });
      disciplina.professores = professores;
    }

    if (habilidades?.length) {
      disciplina.habilidades = habilidades.map(h => this.habilidadeRepository.create({
        nome: h.nome,
        descricao: h.descricao,
      }));
    }

    return this.disciplinaRepository.save(disciplina);
  }

  async findAll(user: any): Promise<Disciplina[]> {
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (user.role === Role.COORDENACAO || user.role === Role.ALUNO) {
      return this.disciplinaRepository.find({
        relations: ['turmas', 'professores', 'habilidades'], // Inclui habilidades
      });
    }

    if (user.role === Role.PROFESSOR) {
      const professor = await this.findProfessorByUsuarioId(user.id);

      if (!professor) {
        throw new ForbiddenException('Professor não encontrado');
      }

      return professor.disciplinas || [];
    }

    throw new ForbiddenException('Acesso não autorizado');
  }

  async findOne(id: string, user: any): Promise<Disciplina> {
    const disciplina = await this.findDisciplinaOrFail(id);

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (user.role === Role.COORDENACAO || user.role === Role.ALUNO) {
      return disciplina;
    }

    if (user.role === Role.PROFESSOR) {
      const professor = await this.findProfessorByUsuarioId(user.id);

      if (
        !professor ||
        !professor.disciplinas?.some(
          (d) => d.id_disciplina === disciplina.id_disciplina,
        )
      ) {
        throw new ForbiddenException(
          'Professor não autorizado para acessar esta disciplina',
        );
      }

      return disciplina;
    }

    throw new ForbiddenException('Acesso não autorizado');
  }

  async update(
    id: string,
    updateDisciplinaDto: UpdateDisciplinaDto,
    user: any,
  ): Promise<Disciplina> {
    this.assertCanManage(user);

    const disciplina = await this.findDisciplinaOrFail(id);

    if (
      updateDisciplinaDto.codigo_disciplina &&
      updateDisciplinaDto.codigo_disciplina !== disciplina.codigo_disciplina
    ) {
      const exists = await this.disciplinaRepository.findOne({
        where: { codigo_disciplina: updateDisciplinaDto.codigo_disciplina },
      });

      if (exists) {
        throw new BadRequestException(
          `Disciplina com código ${updateDisciplinaDto.codigo_disciplina} já existe`,
        );
      }

      disciplina.codigo_disciplina = updateDisciplinaDto.codigo_disciplina;
    }

    if (updateDisciplinaDto.nome_disciplina !== undefined) {
      disciplina.nome_disciplina = updateDisciplinaDto.nome_disciplina;
    }

    if (updateDisciplinaDto.cargaHoraria !== undefined) {
      disciplina.cargaHoraria = updateDisciplinaDto.cargaHoraria;
    }

    return this.disciplinaRepository.save(disciplina);
  }

  async remove(id: string, user: any): Promise<void> {
    this.assertCanManage(user);

    const disciplina = await this.findDisciplinaOrFail(id);

    if (disciplina.turmas?.length) {
      throw new BadRequestException(
        'Disciplina vinculada a turmas não pode ser removida',
      );
    }

    await this.disciplinaRepository.remove(disciplina);
  }

  async addHabilidade(
    disciplinaId: string,
    dto: CreateHabilidadeDto,
    user: any,
  ): Promise<Habilidade> {
    this.assertCanManage(user);

    const disciplina = await this.findDisciplinaOrFail(disciplinaId);

    const habilidade = this.habilidadeRepository.create({
      nome: dto.nome, 
      descricao: dto.descricao,
      disciplina,
    });

    return this.habilidadeRepository.save(habilidade);
  }
    private async findHabilidadeOrFail(id: string): Promise<Habilidade> {
    const habilidade = await this.habilidadeRepository.findOne({
      where: { id },
      relations: ['disciplina'],
    });

    if (!habilidade) {
      throw new NotFoundException(`Habilidade com ID ${id} não encontrada`);
    }

    return habilidade;
  }

  async updateHabilidade(
    habilidadeId: string,
    updateHabilidadeDto: UpdateHabilidadeDto,
    user: any,
  ): Promise<Habilidade> {
    this.assertCanManage(user);

    const habilidade = await this.findHabilidadeOrFail(habilidadeId);

    if (updateHabilidadeDto.nome !== undefined) {
      habilidade.nome = updateHabilidadeDto.nome;
    }

    if (updateHabilidadeDto.descricao !== undefined) {
      habilidade.descricao = updateHabilidadeDto.descricao;
    }

    return this.habilidadeRepository.save(habilidade);
  }

  async removeHabilidade(habilidadeId: string, user: any): Promise<void> {
    this.assertCanManage(user);

    const habilidade = await this.findHabilidadeOrFail(habilidadeId);

    await this.habilidadeRepository.remove(habilidade);
  }
}

