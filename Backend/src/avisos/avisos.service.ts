import {
  Injectable,
  NotFoundException,
  BadRequestException,
ForbiddenException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Aviso, TipoAviso } from './entities/aviso.entity';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { FilterAvisoDto } from './dto/filter-aviso.dto';
import { Usuario, Role } from '../usuario/entities/usuario.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Aluno } from '../aluno/entities/aluno.entity';

type AnyUser = Partial<Usuario> & { id?: string; role?: Role };

@Injectable()
export class AvisosService {
  constructor(
    @InjectRepository(Aviso)
    private readonly avisoRepository: Repository<Aviso>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
  ) { }

 

  private async findUsuarioOrFail(id: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    return usuario;
  }

  private async findTurmaOrFail(id: string) {
    const turma = await this.turmaRepository.findOne({ where: { id } });
    if (!turma) throw new NotFoundException(`Turma com ID ${id} não encontrada`);
    return turma;
  }

  private async findAlunoById(id: string) {
    return this.alunoRepository.findOne({
      where: { id },
      relations: ['usuario', 'turma'],
    });
  }

  private async findAlunoOrFailById(id: string) {
    const aluno = await this.findAlunoById(id);
    if (!aluno) throw new NotFoundException(`Aluno com ID ${id} não encontrado`);
    return aluno;
  }

  private async findAlunoByUsuarioId(usuarioId: string) {
    return this.alunoRepository.findOne({
      where: { usuario: { id: usuarioId } as any },
      relations: ['usuario', 'turma'],
    });
  }

  private parseDateOrThrow(date?: string | Date): Date {
    if (!date) throw new BadRequestException('Data inválida ou ausente');
    const d = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) throw new BadRequestException('Data inválida');
    return d;
  }

  private assertIsCoordenacao(user: AnyUser): void {
    if (!user) throw new ForbiddenException('Usuário não autenticado');
    if (user.role !== Role.COORDENACAO) {
      throw new ForbiddenException('Apenas coordenação pode executar esta ação');
    }
  }

  /**
   * Verifica se o usuário pode ler o aviso.
   * - GERAL: qualquer usuário autenticado
   * - TURMA: coordenação; professor que ministra a turma; alunos vinculados à turma
   * - INDIVIDUAL: coordenação; destinatário (destinatarioAlunoId) ou autor
   */
  private async assertCanRead(aviso: Aviso, user: AnyUser): Promise<void> {
    if (!user) throw new ForbiddenException('Usuário não autenticado');
    if (!user.id) throw new ForbiddenException('ID do usuário não disponível');

    if (aviso.tipo === TipoAviso.GERAL) return;

    if (aviso.tipo === TipoAviso.INDIVIDUAL) {
      if (user.role === Role.COORDENACAO) return;
      if (aviso.usuario && aviso.usuario.id === user.id) return;
      if (aviso.destinatarioAlunoId) {
        const aluno = await this.findAlunoByUsuarioId(user.id.toString());
        if (aluno && aluno.id === aviso.destinatarioAlunoId) return;
      }
      throw new ForbiddenException('Aviso individual apenas para destinatário ou coordenação');
    }

    if (aviso.tipo === TipoAviso.TURMA) {
      if (user.role === Role.COORDENACAO) return;

      // professor: checar se ministra a turma
      if (user.role === Role.PROFESSOR) {
        // se a relação turma.professor estiver carregada, use-a; caso contrário, busque a turma com professor
        if (aviso.turma?.professor?.usuario?.id === user.id) return;

        if (aviso.turma?.id) {
          const turma = await this.turmaRepository.findOne({
            where: { id: aviso.turma.id },
            relations: ['professor', 'professor.usuario'],
          });
          if (turma && turma.professor && turma.professor.usuario?.id === user.id) return;
        }
      }

      // aluno: checar vínculo aluno <-> turma
      if (user.role === Role.ALUNO) {
        const aluno = await this.findAlunoByUsuarioId(user.id.toString());
        if (aluno && aluno.turma && aviso.turma && aluno.turma.id === aviso.turma.id) return;
      }

      throw new ForbiddenException('Usuário não autorizado para ver este aviso de turma');
    }
  }

  // --------------------
  // CRUD
  // --------------------

  async create(createDto: CreateAvisoDto, user: AnyUser): Promise<Aviso> {
    this.assertIsCoordenacao(user);

    const {
      nome,
      descricao,
      tipo = TipoAviso.GERAL,
      dataInicio,
      datafinal,
      usuarioId,
      turmaId,
      destinatarioAlunoId,
    } = createDto;

    if (!nome || !descricao) throw new BadRequestException('nome e descricao são obrigatórios');

    const autorId = usuarioId ? usuarioId.toString() : user.id?.toString();
    if (!autorId) {
      throw new BadRequestException('ID do usuário não encontrado');
    }
    const autor = await this.findUsuarioOrFail(autorId);

    let turma: Turma | undefined = undefined;
    if (tipo === TipoAviso.TURMA) {
      if (!turmaId) throw new BadRequestException('turmaId é obrigatório para avisos do tipo TURMA');
      turma = await this.findTurmaOrFail(turmaId);
    }

    let destinatarioAluno: string | undefined = undefined;
    if (tipo === TipoAviso.INDIVIDUAL) {
      if (!destinatarioAlunoId) throw new BadRequestException('destinatarioAlunoId é obrigatório para avisos do tipo INDIVIDUAL');
      await this.findAlunoOrFailById(destinatarioAlunoId);
      destinatarioAluno = destinatarioAlunoId;
    }

    const di = this.parseDateOrThrow(dataInicio);
    const dfinal = datafinal ? this.parseDateOrThrow(datafinal) : undefined;
    if (dfinal && dfinal < di) throw new BadRequestException('datafinal não pode ser anterior à dataInicio');

    const aviso = this.avisoRepository.create({
      nome,
      descricao,
      tipo,
      dataInicio: di,
      datafinal: dfinal,
      usuario: autor,
      turma: tipo === TipoAviso.TURMA ? turma : undefined,
      destinatarioAlunoId: tipo === TipoAviso.INDIVIDUAL ? destinatarioAluno : undefined,
    });

    return this.avisoRepository.save(aviso);
  }

  async findAll(filters: FilterAvisoDto | undefined, user: AnyUser): Promise<Aviso[]> {
    if (!user) throw new ForbiddenException('Usuário não autenticado');

    const qb = this.avisoRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.usuario', 'usuario')
      .leftJoinAndSelect('a.turma', 'turma')
      .leftJoinAndSelect('turma.professor', 'professor')
      .leftJoinAndSelect('professor.usuario', 'professorUsuario')
      .orderBy('a.dataInicio', 'DESC');

    if (filters?.tipo) qb.andWhere('a.tipo = :tipo', { tipo: filters.tipo });
    if (filters?.usuarioId) qb.andWhere('usuario.id = :uid', { uid: filters.usuarioId });
    if (filters?.turmaId) qb.andWhere('turma.id = :tid', { tid: filters.turmaId });
    if (filters?.termo) qb.andWhere('(a.nome ILIKE :t OR a.descricao ILIKE :t)', { t: `%${filters.termo}%` });

    if (filters?.dataInicio) {
      const dInicio = this.parseDateOrThrow(filters.dataInicio);
      qb.andWhere('a.dataInicio >= :dInicio', { dInicio: dInicio.toISOString() });
    }
    if (filters?.datafinal) {
      const dfinal = this.parseDateOrThrow(filters.datafinal);
      qb.andWhere('a.dataInicio <= :dfinal', { dfinal: dfinal.toISOString() });
    }

    const all = await qb.getMany();

    // Filtrar por visibilidade em memória (mantendo segurança)
    const visibles: Aviso[] = [];
    for (const a of all) {
      try {
        await this.assertCanRead(a, user);
        visibles.push(a);
      } catch {
        // ignorar não visíveis
      }
    }

    return visibles;
  }

  async findOne(id: string, user: AnyUser): Promise<Aviso> {
    const aviso = await this.avisoRepository.findOne({
      where: { id },
      relations: ['usuario', 'turma', 'turma.professor', 'turma.professor.usuario'],
    });
    if (!aviso) throw new NotFoundException(`Aviso com ID ${id} não encontrado`);

    await this.assertCanRead(aviso, user);
    return aviso;
  }

  async update(id: string, updateDto: UpdateAvisoDto, user: AnyUser): Promise<Aviso> {
    this.assertIsCoordenacao(user);

    const aviso = await this.avisoRepository.findOne({
      where: { id },
      relations: ['usuario', 'turma'],
    });
    if (!aviso) throw new NotFoundException(`Aviso com ID ${id} não encontrado`);

    if (updateDto.nome !== undefined) aviso.nome = updateDto.nome;
    if (updateDto.descricao !== undefined) aviso.descricao = updateDto.descricao;
    if (updateDto.tipo !== undefined) aviso.tipo = updateDto.tipo;
    if (updateDto.dataInicio !== undefined) aviso.dataInicio = this.parseDateOrThrow(updateDto.dataInicio);
    if (updateDto.datafinal !== undefined) {
      aviso.datafinal = updateDto.datafinal ? this.parseDateOrThrow(updateDto.datafinal) : undefined;
    }

    if (updateDto.turmaId !== undefined) {
      if (updateDto.turmaId === null) {
        aviso.turma = null;
      } else {
        aviso.turma = await this.findTurmaOrFail(updateDto.turmaId);
      }
    }

    if (updateDto.destinatarioAlunoId !== undefined) {
      if (updateDto.destinatarioAlunoId === null) {
        aviso.destinatarioAlunoId = null;
      } else {
        await this.findAlunoOrFailById(updateDto.destinatarioAlunoId);
        aviso.destinatarioAlunoId = updateDto.destinatarioAlunoId;
      }
    }

    if (updateDto.usuarioId !== undefined) {
      if (updateDto.usuarioId === null) {
        throw new BadRequestException('usuarioId não pode ser null');
      }
      aviso.usuario = await this.findUsuarioOrFail(updateDto.usuarioId);
    }

    return this.avisoRepository.save(aviso);
  }

  async remove(id: string, user: AnyUser): Promise<void> {
    this.assertIsCoordenacao(user);

    const aviso = await this.avisoRepository.findOne({
      where: { id },
      relations: ['usuario', 'turma'],
    });
    if (!aviso) throw new NotFoundException(`Aviso com ID ${id} não encontrado`);

    await this.avisoRepository.remove(aviso);
  }
}
