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
import { Usuario, Role } from '../usuario/entities/usuario.entity';

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

  private assertCanManage(user: any): void {
    if (!user || user.role !== Role.COORDENACAO) {
      throw new ForbiddenException(
        'Apenas usuários da coordenação podem executar esta ação',
      );
    }
  }

  private async findDisciplinaOrFail(id: string): Promise<Disciplina> {
    const disciplina = await this.disciplinaRepository.findOne({
      where: { id_disciplina: id },
      relations: ['turmas', 'professores', 'habilidades'],
    });

    if (!disciplina) {
      throw new NotFoundException(`Disciplina com ID ${id} não encontrada`);
    }

    return disciplina;
  }

  private async findProfessorByUsuarioId(
    usuarioId: string,
  ): Promise<Professor | null> {
    return this.professorRepository.findOne({
      where: { usuario: { id: usuarioId } as any },
      relations: ['disciplinas'],
    });
  }

  private async gerarCodigoDisciplina(
    nome: string,
  ): Promise<string> {
    const prefixo = nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .substring(0, 3)
      .toUpperCase();

    const ultimaDisciplina = await this.disciplinaRepository
      .createQueryBuilder('d')
      .where('d.codigo_disciplina LIKE :prefixo', {
        prefixo: `${prefixo}%`,
      })
      .orderBy('d.codigo_disciplina', 'DESC')
      .getOne();

    let proximoNumero = 1;

    if (ultimaDisciplina) {
      const numeroAtual = parseInt(
        ultimaDisciplina.codigo_disciplina.substring(3),
        10,
      );
      proximoNumero = numeroAtual + 1;
    }

    return `${prefixo}${proximoNumero.toString().padStart(3, '0')}`;
  }

  async create(
    createDisciplinaDto: CreateDisciplinaDto,
    user: any,
  ): Promise<Disciplina> {
    this.assertCanManage(user);

    const {
      nome_disciplina,
      cargaHoraria,
      turmasIds,
      professoresIds,
      habilidades,
    } = createDisciplinaDto;

    const codigo_disciplina =
      await this.gerarCodigoDisciplina(nome_disciplina);

    const disciplina = this.disciplinaRepository.create({
      codigo_disciplina,
      nome_disciplina,
      cargaHoraria,
    });

    if (turmasIds?.length) {
      disciplina.turmas = await this.turmaRepository.find({
        where: { id: In(turmasIds) },
      });
    }

    if (professoresIds?.length) {
      disciplina.professores = await this.professorRepository.find({
        where: { id: In(professoresIds) },
      });
    }

    if (habilidades?.length) {
      disciplina.habilidades = habilidades.map((h) =>
        this.habilidadeRepository.create({
          nome: h.nome,
          descricao: h.descricao,
        }),
      );
    }

    return this.disciplinaRepository.save(disciplina);
  }

  async findAll(user: any): Promise<Disciplina[]> {
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    if (user.role === Role.COORDENACAO || user.role === Role.ALUNO) {
      return this.disciplinaRepository.find({
        relations: ['turmas', 'professores', 'habilidades'],
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

  const {
    nome_disciplina,
    cargaHoraria,
    professoresIds,
    turmasIds,
  } = updateDisciplinaDto;

  if (nome_disciplina !== undefined) {
    disciplina.nome_disciplina = nome_disciplina;
  }

  if (cargaHoraria !== undefined) {
    disciplina.cargaHoraria = cargaHoraria;
  }

  //  Atualiza professores (remove e adiciona vínculos)
  if (professoresIds !== undefined) {
    if (professoresIds.length === 0) {
      disciplina.professores = [];
    } else {
      const professores = await this.professorRepository.find({
        where: { id: In(professoresIds) },
      });

      if (professores.length !== professoresIds.length) {
        throw new BadRequestException(
          'Um ou mais professores não foram encontrados',
        );
      }

      disciplina.professores = professores;
    }
  }

  //  Atualiza turmas (remove e adiciona vínculos)
  if (turmasIds !== undefined) {
    if (turmasIds.length === 0) {
      disciplina.turmas = [];
    } else {
      const turmas = await this.turmaRepository.find({
        where: { id: In(turmasIds) },
      });

      if (turmas.length !== turmasIds.length) {
        throw new BadRequestException(
          'Uma ou mais turmas não foram encontradas',
        );
      }

      disciplina.turmas = turmas;
    }
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

  async removeHabilidade(
    habilidadeId: string,
    user: any,
  ): Promise<void> {
    this.assertCanManage(user);

    const habilidade = await this.findHabilidadeOrFail(habilidadeId);

    await this.habilidadeRepository.remove(habilidade);
  }

async findHabilidades(disciplinaId: string) {
  const disciplina = await this.disciplinaRepository.findOne({
    where: { id_disciplina: disciplinaId },
  });

  if (!disciplina) {
    throw new NotFoundException('Disciplina não encontrada');
  }

  return this.habilidadeRepository.find({
    where: { disciplina: { id_disciplina: disciplinaId } },
    select: ['id', 'nome', 'descricao'], // ADICIONADO 'nome' AQUI
    order: { nome: 'ASC' }, //  para ordenar por nome
  });
}
}
