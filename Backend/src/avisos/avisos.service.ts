import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Aviso, TipoAviso } from './entities/aviso.entity';
import { AvisoConfirmacao } from './entities/AvisoConfirmacao.entity';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { FilterAvisoDto } from './dto/filter-aviso.dto';
import { FilterCalendarioDto } from './dto/filter-calendario.dto';
import { Usuario, Role } from '../usuario/entities/usuario.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Professor } from '../professor/entities/professor.entity';

type AnyUser = Partial<Usuario> & { id?: string; role?: Role };

@Injectable()
export class AvisosService {
  constructor(
    @InjectRepository(Aviso)
    private readonly avisoRepository: Repository<Aviso>,
    @InjectRepository(AvisoConfirmacao)
    private readonly confirmacaoRepo: Repository<AvisoConfirmacao>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
    @InjectRepository(Professor)
  private readonly professorRepository: Repository<Professor>,
  ) {}

  private async findUsuarioOrFail(id: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException();
    return usuario;
  }

  private async findTurmaOrFail(id: string) {
    const turma = await this.turmaRepository.findOne({ where: { id } });
    if (!turma) throw new NotFoundException();
    return turma;
  }

  private async findAlunoOrFail(id: string) {
    const aluno = await this.alunoRepository.findOne({
      where: { id },
      relations: ['turma'],
    });
    if (!aluno) throw new NotFoundException();
    return aluno;
  }

  private async findAlunoByUsuarioId(usuarioId: string) {
    return this.alunoRepository.findOne({
      where: { usuario: { id: usuarioId } as any },
      relations: ['turma'],
    });
  }

  private async findProfessorOrFail(id: string) {
  const professor = await this.professorRepository.findOne({
    where: { id },
    relations: ['usuario', 'turmas'],
  });
  if (!professor) throw new NotFoundException('Professor não encontrado');
  return professor;
}
private async findProfessorByUsuarioId(usuarioId: string) {
  const professor = await this.professorRepository.findOne({
    where: { usuario: { id: usuarioId } },
    relations: ['usuario', 'turmas'],
  });
  if (!professor) throw new NotFoundException('Professor não encontrado para este usuário');
  return professor;
}

  private parseDateOrThrow(value?: string | Date): Date {
    if (!value) throw new BadRequestException();
    if (value instanceof Date) {
      if (isNaN(value.getTime())) throw new BadRequestException();
      return value;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
    }
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) throw new BadRequestException();
    return parsed;
  }

  private assertIsCoordenacao(user: AnyUser) {
    if (!user?.id || user.role !== Role.COORDENACAO)
      throw new ForbiddenException();
  }

  private async validateAvisoByTipo(
    tipo: TipoAviso,
    turmaId?: string | null,
    destinatarioAlunoId?: string | null,
    destinatarioProfessorId?: string | null,
  ) {
    if (tipo === TipoAviso.GERAL) {
      if (turmaId || destinatarioAlunoId) throw new BadRequestException();
    }

    if (tipo === TipoAviso.TURMA) {
      if (!turmaId || destinatarioAlunoId) throw new BadRequestException();
      await this.findTurmaOrFail(turmaId);
    }

    if (tipo === TipoAviso.INDIVIDUAL) {
      if (!destinatarioAlunoId || turmaId) throw new BadRequestException();
      await this.findAlunoOrFail(destinatarioAlunoId);
    }

    if (tipo === TipoAviso.PROFESSOR) {
    if (!destinatarioProfessorId || turmaId || destinatarioAlunoId)throw new BadRequestException()
    await this.findProfessorOrFail(destinatarioProfessorId);
    }
  }

  private async assertCanRead(aviso: Aviso, user: AnyUser) {
    if (!user?.id) throw new ForbiddenException();

    if (aviso.tipo === TipoAviso.GERAL) return;

    if (aviso.tipo === TipoAviso.INDIVIDUAL) {
      if (user.role === Role.COORDENACAO) return;
      if (aviso.usuario.id === user.id) return;
      const aluno = await this.findAlunoByUsuarioId(user.id);
      if (aluno?.id === aviso.destinatarioAlunoId) return;
      throw new ForbiddenException();
    }

    if (aviso.tipo === TipoAviso.TURMA) {
      if (user.role === Role.COORDENACAO) return;

      if (
        user.role === Role.PROFESSOR &&
        aviso.turma?.professor?.usuario?.id === user.id
      )
        return;

      if (user.role === Role.ALUNO) {
        const aluno = await this.findAlunoByUsuarioId(user.id);
        if (aluno?.turma?.id === aviso.turma?.id) return;
      }

      throw new ForbiddenException();
    }
    if (aviso.tipo === TipoAviso.PROFESSOR) {
  if (user.role === Role.COORDENACAO) return;
  if (user.role === Role.PROFESSOR && aviso.destinatarioProfessorId === user.id) return;
  throw new ForbiddenException();
}

  }

  async create(dto: CreateAvisoDto, user: AnyUser): Promise<Aviso> {
    this.assertIsCoordenacao(user);

    const tipoFinal = dto.tipo ?? TipoAviso.GERAL;

    await this.validateAvisoByTipo(
      tipoFinal,
      dto.turmaId ?? null,
      dto.destinatarioAlunoId ?? null,
      dto.destinatarioProfessorId ?? null,
    );

    const autor = await this.findUsuarioOrFail(user.id!);

    const aviso = this.avisoRepository.create({
      nome: dto.nome,
      descricao: dto.descricao,
      tipo: tipoFinal,
      categoria: dto.categoria,
      dataInicio: this.parseDateOrThrow(dto.dataInicio),
      dataFinal: dto.dataFinal
        ? this.parseDateOrThrow(dto.dataFinal)
        : undefined,
      usuario: autor,
      turma: dto.turmaId ? await this.findTurmaOrFail(dto.turmaId) : null,
      destinatarioAlunoId: dto.destinatarioAlunoId ?? null,
      destinatarioProfessorId: dto.destinatarioProfessorId ?? null,
    });

    return this.avisoRepository.save(aviso);
  }

  async findAll(filters: FilterAvisoDto, user: AnyUser): Promise<any[]> {
    if (!user?.id) throw new ForbiddenException();

    const qb = this.avisoRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.usuario', 'usuario')
      .leftJoinAndSelect('a.turma', 'turma')
      .orderBy('a.dataInicio', 'DESC');

    if (filters?.tipo) qb.andWhere('a.tipo = :tipo', { tipo: filters.tipo });
    if (filters?.turmaId)
      qb.andWhere('turma.id = :tid', { tid: filters.turmaId });
    if (filters?.termo)
      qb.andWhere('(a.nome LIKE :t OR a.descricao LIKE :t)', {
        t: `%${filters.termo}%`,
      });

    const avisos = await qb.getMany();

    const confirmacoes = await this.confirmacaoRepo.find({
      where: {
        usuario: { id: user.id },
      },
      relations: ['aviso'],
    });

    const confirmacoesMap = new Map(confirmacoes.map((c) => [c.aviso.id, c]));

    const visiveis: any[] = [];

    for (const aviso of avisos) {
      try {
        await this.assertCanRead(aviso, user);

        const confirmacao = confirmacoesMap.get(aviso.id);

        visiveis.push({
          ...aviso,
          confirmado: !!confirmacao,
          confirmadoEm: confirmacao?.confirmadoEm ?? null,
        });
      } catch {}
    }

    return visiveis;
  }

  async findNaoConfirmados(user: AnyUser): Promise<Aviso[]> {
    if (!user?.id) throw new ForbiddenException();

    const qb = this.avisoRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.usuario', 'usuario')
      .leftJoinAndSelect('a.turma', 'turma')
      .leftJoin(
        'avisos_confirmacoes',
        'c',
        'c.aviso_id = a.id AND c.usuario_id = :uid',
        { uid: user.id },
      )
      .where('c.id IS NULL')
      .orderBy('a.dataInicio', 'DESC');

    const avisos = await qb.getMany();
    const visiveis: Aviso[] = [];

    for (const aviso of avisos) {
      try {
        await this.assertCanRead(aviso, user);
        visiveis.push(aviso);
      } catch {}
    }

    return visiveis;
  }

  async findOne(id: string, user: AnyUser): Promise<Aviso> {
    const aviso = await this.avisoRepository.findOne({
      where: { id },
      relations: [
        'usuario',
        'turma',
        'turma.professor',
        'turma.professor.usuario',
      ],
    });
    if (!aviso) throw new NotFoundException();
    await this.assertCanRead(aviso, user);
    return aviso;
  }

  async update(id: string, dto: UpdateAvisoDto, user: AnyUser): Promise<Aviso> {
    this.assertIsCoordenacao(user);

    const aviso = await this.avisoRepository.findOne({ where: { id } });
    if (!aviso) throw new NotFoundException();

    const tipoFinal = dto.tipo ?? aviso.tipo;
    const turmaIdFinal =
      dto.turmaId !== undefined ? dto.turmaId : (aviso.turma?.id ?? null);
    const alunoIdFinal =
      dto.destinatarioAlunoId !== undefined
        ? dto.destinatarioAlunoId
        : (aviso.destinatarioAlunoId ?? null);

    await this.validateAvisoByTipo(tipoFinal, turmaIdFinal, alunoIdFinal);

    aviso.nome = dto.nome ?? aviso.nome;
    aviso.descricao = dto.descricao ?? aviso.descricao;
    aviso.tipo = tipoFinal;
    aviso.categoria = dto.categoria ?? aviso.categoria;
    aviso.dataInicio = dto.dataInicio
      ? this.parseDateOrThrow(dto.dataInicio)
      : aviso.dataInicio;
    aviso.dataFinal =
      dto.dataFinal !== undefined
        ? dto.dataFinal
          ? this.parseDateOrThrow(dto.dataFinal)
          : undefined
        : aviso.dataFinal;
    aviso.turma = turmaIdFinal
      ? await this.findTurmaOrFail(turmaIdFinal)
      : null;
    aviso.destinatarioAlunoId = alunoIdFinal;

    return this.avisoRepository.save(aviso);
  }

  async remove(id: string, user: AnyUser): Promise<void> {
    this.assertIsCoordenacao(user);
    const aviso = await this.avisoRepository.findOne({ where: { id } });
    if (!aviso) throw new NotFoundException();
    await this.avisoRepository.remove(aviso);
  }

  async findForCalendar(
    filters: FilterCalendarioDto,
    user: AnyUser,
  ): Promise<Aviso[]> {
    const inicio = this.parseDateOrThrow(filters.inicio);
    const fim = this.parseDateOrThrow(filters.fim);

    const avisos = await this.avisoRepository
      .createQueryBuilder('a')
      .where(
        new Brackets((qb) => {
          qb.where('a.dataInicio BETWEEN :i AND :f', {
            i: inicio,
            f: fim,
          }).orWhere(
            '(a.dataFinal IS NOT NULL AND a.dataFinal BETWEEN :i AND :f)',
            { i: inicio, f: fim },
          );
        }),
      )
      .getMany();

    const visiveis: Aviso[] = [];

    for (const aviso of avisos) {
      try {
        await this.assertCanRead(aviso, user);
        visiveis.push(aviso);
      } catch {}
    }

    return visiveis;
  }

  async confirmar(avisoId: string, user: AnyUser): Promise<void> {
    if (!user?.id) throw new ForbiddenException();

    const aviso = await this.findOne(avisoId, user);

    const existe = await this.confirmacaoRepo.findOne({
      where: {
        aviso: { id: avisoId },
        usuario: { id: user.id },
      },
    });

    if (existe) return;

    await this.confirmacaoRepo.save(
      this.confirmacaoRepo.create({
        aviso,
        usuario: { id: user.id } as Usuario,
      }),
    );
  }
}
