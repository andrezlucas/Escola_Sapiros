import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Frequencia, StatusFrequencia } from './entities/frequencia.entity';
import { CreateFrequenciaDto } from './dto/create-frequencia.dto';
import { UpdateFrequenciaDto } from './dto/update-frequencia.dto';
import { FrequenciaFilterDto } from './dto/frequencia-filter.dto';

import { Aluno } from '../aluno/entities/aluno.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Usuario, Role } from '../usuario/entities/usuario.entity';
import { Documento } from '../documentacao/entities/documento.entity';
import { Documentacao } from '../documentacao/entities/documentacao.entity';
import { TipoDocumento } from '../documentacao/enums/tipo-documento.enum';

@Injectable()
export class FrequenciaService {
  constructor(
    @InjectRepository(Frequencia)
    private readonly frequenciaRepository: Repository<Frequencia>,
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
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
    @InjectRepository(Documentacao)
    private readonly documentacaoRepository: Repository<Documentacao>,

  ) {}

  private async findAlunoByMatricula(matricula: string): Promise<Aluno> {
    const aluno = await this.alunoRepository.findOne({
      where: { matriculaAluno: matricula },
    });
    if (!aluno)
      throw new NotFoundException(
        `Aluno com matrícula ${matricula} não encontrado`,
      );
    return aluno;
  }

  private async findDisciplinaById(id: string): Promise<Disciplina> {
    const disciplina = await this.disciplinaRepository.findOne({
      where: { id_disciplina: id },
    });
    if (!disciplina)
      throw new NotFoundException(`Disciplina com ID ${id} não encontrada`);
    return disciplina;
  }

  private async findTurmaById(id: string): Promise<Turma> {
    const turma = await this.turmaRepository.findOne({ where: { id } });
    if (!turma)
      throw new NotFoundException(`Turma com ID ${id} não encontrada`);
    return turma;
  }

  private getUserMatricula(user: any): string | undefined {
    return user?.matriculaAluno ?? user?.matricula_aluno ?? user?.matricula;
  }

  private async findProfessorByUsuarioId(
    usuarioId: string,
  ): Promise<Professor | null> {
    return this.professorRepository.findOne({
      where: { usuario: { id: usuarioId } as any },
      relations: ['turmas', 'turmas.disciplinas'],
    });
  }

  private async professorMinistraDisciplina(
    professor: Professor,
    disciplinaId: string,
  ): Promise<boolean> {
    if (!professor) return false;

    for (const t of professor.turmas || []) {
      if (
        t.disciplinas &&
        t.disciplinas.some((d) => d.id_disciplina === disciplinaId)
      ) {
        return true;
      }

      if (!t.disciplinas || t.disciplinas.length === 0) {
        const turmaFull = await this.turmaRepository.findOne({
          where: { id: t.id },
          relations: ['disciplinas'],
        });

        if (
          turmaFull &&
          turmaFull.disciplinas.some((d) => d.id_disciplina === disciplinaId)
        ) {
          return true;
        }
      }
    }

    return false;
  }

 private parseDateOrThrow(dateStr?: string | Date): Date {
  if (!dateStr) {
    throw new BadRequestException('Data inválida ou ausente');
  }

  if (dateStr instanceof Date) {
    return dateStr;
  }

  const [year, month, day] = dateStr.split('-').map(Number);

  if (!year || !month || !day) {
    throw new BadRequestException('Formato de data inválido');
  }

  return new Date(year, month - 1, day, 12, 0, 0);
}


  private async assertCanReadFrequencia(
    frequencia: Frequencia,
    user: any,
  ): Promise<void> {
    if (!user) throw new ForbiddenException('Usuário não autenticado');

    if (user.role === Role.COORDENACAO) return;

    if (user.role === Role.PROFESSOR) {
      const professor = await this.findProfessorByUsuarioId(user.id);
      if (!professor)
        throw new ForbiddenException(
          'Professor não encontrado para o usuário autenticado',
        );

      const ok = await this.professorMinistraDisciplina(
        professor,
        frequencia.disciplina.id_disciplina,
      );
      if (!ok)
        throw new ForbiddenException(
          'Professor não autorizado para acessar esta frequência',
        );
      return;
    }

    if (user.role === Role.ALUNO) {
      if (!frequencia.aluno)
        throw new NotFoundException('Frequência sem aluno vinculado');

      const mat = this.getUserMatricula(user);
      if (!mat)
        throw new ForbiddenException('Matrícula do aluno não encontrada no token');

      if (frequencia.aluno.matriculaAluno !== mat) {
        throw new ForbiddenException('Aluno não autorizado a ver esta frequência');
      }
      return;
    }

    throw new ForbiddenException('Role não autorizada');
  }

  private async assertCanModifyFrequencia(
    frequencia: Frequencia | null,
    user: any,
    disciplinaIdForCreate?: string,
  ): Promise<void> {
    if (!user) throw new ForbiddenException('Usuário não autenticado');

    if (user.role === Role.COORDENACAO) return;

    if (user.role === Role.PROFESSOR) {
      const professor = await this.findProfessorByUsuarioId(user.id);
      if (!professor)
        throw new ForbiddenException(
          'Professor não encontrado para o usuário autenticado',
        );

      if (frequencia) {
        const ok = await this.professorMinistraDisciplina(
          professor,
          frequencia.disciplina.id_disciplina,
        );
        if (!ok)
          throw new ForbiddenException(
            'Professor não autorizado para modificar esta frequência',
          );
        return;
      }

      if (!disciplinaIdForCreate)
        throw new BadRequestException(
          'Disciplina é obrigatória para criação de frequência',
        );

      const ministra = await this.professorMinistraDisciplina(
        professor,
        disciplinaIdForCreate,
      );
      if (!ministra)
        throw new ForbiddenException(
          'Professor não autorizado para criar frequência nesta disciplina',
        );
      return;
    }

    throw new ForbiddenException(
      'Apenas coordenação e professores podem modificar frequências',
    );
  }

  /**
   * Cria uma frequência.
   * createFrequenciaDto deve conter:
   * - data (string ou Date)
   * - presente (boolean)
   * - observacao? (string)
   * - alunoId (matrícula do aluno)
   * - disciplinaId (UUID)
   * user: req.user (id, role, matricula_aluno quando aplicável)
   */
 async create(
  createFrequenciaDto: CreateFrequenciaDto,
  user: any,
): Promise<Frequencia> {
  const {
    data,
    status,
    justificativa,
    faltasNoPeriodo,
    alunoId,
    disciplinaId,
    turmaId,
  } = createFrequenciaDto;

  if (!alunoId) throw new BadRequestException('alunoId é obrigatório');
  if (!disciplinaId) throw new BadRequestException('disciplinaId é obrigatório');
  if (!turmaId) throw new BadRequestException('turmaId é obrigatório');

  await this.assertCanModifyFrequencia(null, user, disciplinaId);

  const aluno = await this.findAlunoByMatricula(alunoId);
  const disciplina = await this.findDisciplinaById(disciplinaId);
  const turma = await this.findTurmaById(turmaId);

  const d = this.parseDateOrThrow(data);
  const dataISO = d.toISOString().slice(0, 10);

  const existente = await this.frequenciaRepository
    .createQueryBuilder('f')
    .leftJoinAndSelect('f.aluno', 'aluno')
    .leftJoinAndSelect('f.disciplina', 'disciplina')
    .leftJoinAndSelect('f.turma', 'turma')
    .where('f.aluno_id = :alunoId', { alunoId: aluno.id })
    .andWhere('f.disciplina_id = :disciplinaId', {
      disciplinaId: disciplina.id_disciplina,
    })
    .andWhere('f.turma_id = :turmaId', { turmaId: turma.id })
    .andWhere('f.data = :data', { data: dataISO })
    .getOne();

  if (existente) {
    await this.assertCanModifyFrequencia(existente, user);

    existente.status = status ?? existente.status;
    existente.justificativa =
      justificativa !== undefined
        ? justificativa
        : existente.justificativa;
    existente.faltasNoPeriodo =
      faltasNoPeriodo ?? existente.faltasNoPeriodo;

    return this.frequenciaRepository.save(existente);
  }

  const frequencia = this.frequenciaRepository.create({
    data: d,
    status: status ?? StatusFrequencia.PRESENTE,
    justificativa: justificativa ?? undefined,
    faltasNoPeriodo: faltasNoPeriodo ?? 0,
    aluno,
    disciplina,
    turma,
  });

  try {
    return await this.frequenciaRepository.save(frequencia);
  } catch (e: any) {
    if (
      e?.code === 'ER_DUP_ENTRY' ||
      e?.code === '23505'
    ) {
      const freq = await this.frequenciaRepository
        .createQueryBuilder('f')
        .leftJoinAndSelect('f.aluno', 'aluno')
        .leftJoinAndSelect('f.disciplina', 'disciplina')
        .leftJoinAndSelect('f.turma', 'turma')
        .where('f.aluno_id = :alunoId', { alunoId: aluno.id })
        .andWhere('f.disciplina_id = :disciplinaId', {
          disciplinaId: disciplina.id_disciplina,
        })
        .andWhere('f.turma_id = :turmaId', { turmaId: turma.id })
        .andWhere('f.data = :data', { data: dataISO })
        .getOne();

      if (freq) {
        await this.assertCanModifyFrequencia(freq, user);

        freq.status = status ?? freq.status;
        freq.justificativa =
          justificativa !== undefined
            ? justificativa
            : freq.justificativa;
        freq.faltasNoPeriodo =
          faltasNoPeriodo ?? freq.faltasNoPeriodo;

        return this.frequenciaRepository.save(freq);
      }
    }

    throw e;
  }
}


  /**
   * Lista frequências com filtros e restrições por role.
   * filters: FrequenciaFilterDto (alunoId, disciplinaId, dataInicio, dataFim, presente)
   * user: req.user
   */
  async findAll(
    filters: FrequenciaFilterDto | undefined,
    user: any,
  ): Promise<Frequencia[]> {
    const qb = this.frequenciaRepository
      .createQueryBuilder('f')
      .leftJoinAndSelect('f.aluno', 'aluno')
      .leftJoinAndSelect('f.disciplina', 'disciplina')
      .leftJoinAndSelect('f.turma', 'turma')
      .orderBy('f.data', 'DESC');

    if (filters?.alunoId) {
      qb.andWhere('aluno.matricula_aluno = :alunoId', {
        alunoId: filters.alunoId,
      });
    }

    if (filters?.disciplinaId) {
      qb.andWhere('disciplina.id_disciplina = :disciplinaId', {
        disciplinaId: filters.disciplinaId,
      });
    }

    if (filters?.turmaId) {
      qb.andWhere('turma.id = :turmaId', { turmaId: filters.turmaId });
    }

    if (filters?.status) {
      qb.andWhere('f.status = :status', { status: filters.status });
    } else if (filters?.presente !== undefined) {
      qb.andWhere('f.status = :status', {
        status: filters.presente
          ? StatusFrequencia.PRESENTE
          : StatusFrequencia.FALTA,
      });
    }

    if (filters?.dataInicio) {
      const dInicio = this.parseDateOrThrow(filters.dataInicio);
      qb.andWhere('f.data >= :dataInicio', {
        dataInicio: dInicio.toISOString().slice(0, 10),
      });
    }

    if (filters?.dataFim) {
      const dFim = this.parseDateOrThrow(filters.dataFim);
      qb.andWhere('f.data <= :dataFim', {
        dataFim: dFim.toISOString().slice(0, 10),
      });
    }

    if (!user) throw new ForbiddenException('Usuário não autenticado');

    if (user.role === Role.COORDENACAO) {
      return qb.getMany();
    }

    if (user.role === Role.ALUNO) {
      const mat = this.getUserMatricula(user);
      if (!mat)
        throw new ForbiddenException('Matrícula do aluno não encontrada no token');

      qb.andWhere('aluno.matricula_aluno = :matAluno', { matAluno: mat });
      return qb.getMany();
    }

    if (user.role === Role.PROFESSOR) {
      const professor = await this.findProfessorByUsuarioId(user.id);
      if (!professor)
        throw new ForbiddenException(
          'Professor não encontrado para o usuário autenticado',
        );

      const turmas = await this.turmaRepository.find({
        where: { professor: { id: professor.id } },
        relations: ['disciplinas'],
      });

      const disciplinaIds = turmas.flatMap((t) =>
        (t.disciplinas || []).map((d) => d.id_disciplina),
      );
      if (disciplinaIds.length === 0) return [];

      qb.andWhere('disciplina.id_disciplina IN (:...ids)', {
        ids: disciplinaIds,
      });

      return qb.getMany();
    }

    throw new ForbiddenException('Role não autorizada para listar frequências');
  }

  async resumo(
    alunoId: string,
    disciplinaId: string,
    turmaId: string,
    dataInicio?: string,
    dataFim?: string,
    status?: StatusFrequencia,
    user?: any,
  ): Promise<{
    total: number;
    presentes: number;
    faltas: number;
    faltasJustificadas: number;
    percentualPresenca: number;
  }> {
    if (!alunoId) throw new BadRequestException('alunoId (matrícula) é obrigatório');
    if (!disciplinaId) throw new BadRequestException('disciplinaId é obrigatório');
    if (!turmaId) throw new BadRequestException('turmaId é obrigatório');

    const aluno = await this.findAlunoByMatricula(alunoId);
    const disciplina = await this.findDisciplinaById(disciplinaId);
    const turma = await this.findTurmaById(turmaId);

    const dummyFreq = new Frequencia();
    dummyFreq.aluno = aluno;
    dummyFreq.disciplina = disciplina;

    await this.assertCanReadFrequencia(dummyFreq, user);

    const qb = this.frequenciaRepository
      .createQueryBuilder('f')
      .select([
        'COUNT(f.id) as total',
        `SUM(CASE WHEN f.status = :sPresente THEN 1 ELSE 0 END) as presentes`,
        `SUM(CASE WHEN f.status = :sFalta THEN 1 ELSE 0 END) as faltas`,
        `SUM(CASE WHEN f.status = :sFaltaJust THEN 1 ELSE 0 END) as faltasJustificadas`,
      ])
      .setParameters({
        sPresente: StatusFrequencia.PRESENTE,
        sFalta: StatusFrequencia.FALTA,
        sFaltaJust: StatusFrequencia.FALTA_JUSTIFICADA,
      })
      .where('f.aluno_id = :alunoDbId', { alunoDbId: aluno.id })
      .andWhere('f.disciplina_id = :discDbId', {
        discDbId: disciplina.id_disciplina,
      })
      .andWhere('f.turma_id = :turmaDbId', { turmaDbId: turma.id });

    if (status) {
      qb.andWhere('f.status = :status', { status });
    }

    if (dataInicio) {
      const dInicio = this.parseDateOrThrow(dataInicio);
      qb.andWhere('f.data >= :dataInicio', {
        dataInicio: dInicio.toISOString().slice(0, 10),
      });
    }

    if (dataFim) {
      const dFim = this.parseDateOrThrow(dataFim);
      qb.andWhere('f.data <= :dataFim', {
        dataFim: dFim.toISOString().slice(0, 10),
      });
    }

    const raw = await qb.getRawOne();

    const total = Number(raw?.total ?? 0);
    const presentes = Number(raw?.presentes ?? 0);
    const faltas = Number(raw?.faltas ?? 0);
    const faltasJustificadas = Number(raw?.faltasJustificadas ?? 0);

    const percentualPresenca =
      total === 0 ? 0 : Math.round((presentes / total) * 10000) / 100;

    return { total, presentes, faltas, faltasJustificadas, percentualPresenca };
  }

  /**
   * Busca uma frequência por id_frequencia e valida leitura conforme user.
   */
  async findOne(id: string, user: any): Promise<Frequencia> {
    const frequencia = await this.frequenciaRepository.findOne({
      where: { id: id },
      relations: ['aluno', 'disciplina', 'turma'],
    });
    if (!frequencia)
      throw new NotFoundException(`Frequência com ID ${id} não encontrada`);

    await this.assertCanReadFrequencia(frequencia, user);
    return frequencia;
  }

  /**
   * Atualiza uma frequência. Professores e coordenação podem alterar (professor apenas se ministra a disciplina).
   */
  async update(
    id: string,
    updateFrequenciaDto: UpdateFrequenciaDto,
    user: any,
  ): Promise<Frequencia> {
    const frequencia = await this.frequenciaRepository.findOne({
      where: { id: id },
      relations: ['aluno', 'disciplina', 'turma'],
    });
    if (!frequencia)
      throw new NotFoundException(`Frequência com ID ${id} não encontrada`);

    await this.assertCanModifyFrequencia(frequencia, user);

    if (updateFrequenciaDto.data !== undefined) {
      frequencia.data = this.parseDateOrThrow(updateFrequenciaDto.data);
    }
    if (updateFrequenciaDto.status !== undefined) {
      frequencia.status = updateFrequenciaDto.status;
    }
    if (updateFrequenciaDto.justificativa !== undefined) {
      frequencia.justificativa = updateFrequenciaDto.justificativa;
    }
    if (updateFrequenciaDto.faltasNoPeriodo !== undefined) {
      frequencia.faltasNoPeriodo = updateFrequenciaDto.faltasNoPeriodo;
    }

    if (user?.role === Role.COORDENACAO) {
      if (
        updateFrequenciaDto.alunoId !== undefined &&
        updateFrequenciaDto.alunoId !== frequencia.aluno.matriculaAluno
      ) {
        frequencia.aluno = await this.findAlunoByMatricula(
          updateFrequenciaDto.alunoId,
        );
      }
      if (
        updateFrequenciaDto.disciplinaId !== undefined &&
        updateFrequenciaDto.disciplinaId !== frequencia.disciplina.id_disciplina
      ) {
        frequencia.disciplina = await this.findDisciplinaById(
          updateFrequenciaDto.disciplinaId,
        );
      }
      if (
        updateFrequenciaDto.turmaId !== undefined &&
        updateFrequenciaDto.turmaId !== frequencia.turma.id
      ) {
        frequencia.turma = await this.findTurmaById(updateFrequenciaDto.turmaId);
      }
    }

    return this.frequenciaRepository.save(frequencia);
  }

  async updateStatus(
    id: string,
    status: StatusFrequencia,
    justificativa: string | undefined,
    user: any,
  ): Promise<Frequencia> {
    const frequencia = await this.frequenciaRepository.findOne({
      where: { id },
      relations: ['aluno', 'disciplina', 'turma'],
    });
    if (!frequencia)
      throw new NotFoundException(`Frequência com ID ${id} não encontrada`);

    await this.assertCanModifyFrequencia(frequencia, user);

    frequencia.status = status;
    if (justificativa !== undefined) {
      frequencia.justificativa = justificativa;
    }

    return this.frequenciaRepository.save(frequencia);
  }

  async getEstatisticasTurma(
    turmaId: string,
    disciplinaId: string,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<
    Array<{
      alunoId: string;
      matriculaAluno: string;
      total: number;
      presentes: number;
      faltas: number;
      faltasJustificadas: number;
      percentualPresenca: number;
    }>
  > {
    const turma = await this.findTurmaById(turmaId);
    const disciplina = await this.findDisciplinaById(disciplinaId);

    const alunos = await this.alunoRepository.find({
      where: { turma: { id: turma.id } as any },
    });

    const qb = this.frequenciaRepository
      .createQueryBuilder('f')
      .leftJoin('f.aluno', 'aluno')
      .select([
        'aluno.id as alunoId',
        'aluno.matricula_aluno as matriculaAluno',
        'COUNT(f.id) as total',
        `SUM(CASE WHEN f.status = :sPresente THEN 1 ELSE 0 END) as presentes`,
        `SUM(CASE WHEN f.status = :sFalta THEN 1 ELSE 0 END) as faltas`,
        `SUM(CASE WHEN f.status = :sFaltaJust THEN 1 ELSE 0 END) as faltasJustificadas`,
      ])
      .setParameters({
        sPresente: StatusFrequencia.PRESENTE,
        sFalta: StatusFrequencia.FALTA,
        sFaltaJust: StatusFrequencia.FALTA_JUSTIFICADA,
      })
      .where('f.turma_id = :turmaId', { turmaId: turma.id })
      .andWhere('f.disciplina_id = :disciplinaId', {
        disciplinaId: disciplina.id_disciplina,
      })
      .groupBy('aluno.id')
      .addGroupBy('aluno.matricula_aluno');

    if (dataInicio) {
      const dInicio = this.parseDateOrThrow(dataInicio);
      qb.andWhere('f.data >= :dataInicio', {
        dataInicio: dInicio.toISOString().slice(0, 10),
      });
    }

    if (dataFim) {
      const dFim = this.parseDateOrThrow(dataFim);
      qb.andWhere('f.data <= :dataFim', {
        dataFim: dFim.toISOString().slice(0, 10),
      });
    }

    const rows = await qb.getRawMany();
    const map = new Map<string, any>();
    for (const r of rows) map.set(r.alunoId, r);

    return alunos.map((a) => {
      const r = map.get(a.id);
      const total = Number(r?.total ?? 0);
      const presentes = Number(r?.presentes ?? 0);
      const faltas = Number(r?.faltas ?? 0);
      const faltasJustificadas = Number(r?.faltasJustificadas ?? 0);
      const percentualPresenca =
        total === 0 ? 0 : Math.round((presentes / total) * 10000) / 100;

      return {
        alunoId: a.id,
        matriculaAluno: a.matriculaAluno,
        total,
        presentes,
        faltas,
        faltasJustificadas,
        percentualPresenca,
      };
    });
  }

  /**
   * Remove uma frequência (valida autorização).
   */
  async remove(id: string, user: any): Promise<void> {
    const frequencia = await this.frequenciaRepository.findOne({
      where: { id: id },
      relations: ['aluno', 'disciplina', 'turma'],
    });
    if (!frequencia)
      throw new NotFoundException(`Frequência com ID ${id} não encontrada`);

    await this.assertCanModifyFrequencia(frequencia, user);

    await this.frequenciaRepository.remove(frequencia);
  }

  async anexarJustificativa(
    frequenciaId: string,
    arquivo: Express.Multer.File,
    user: any,
  ): Promise<{ message: string }> {
    if (!arquivo) {
      throw new BadRequestException('Arquivo é obrigatório');
    }

    if (user.role !== Role.PROFESSOR && user.role !== Role.COORDENACAO) {
      throw new ForbiddenException(
        'Apenas professores ou coordenação podem anexar justificativa',
      );
    }

    const frequencia = await this.frequenciaRepository.findOne({
      where: { id: frequenciaId },
      relations: ['aluno', 'disciplina', 'turma'],
    });

    if (!frequencia) {
      throw new NotFoundException('Frequência não encontrada');
    }

    if (frequencia.status === StatusFrequencia.FALTA_JUSTIFICADA) {
      throw new BadRequestException(
        'Esta falta já foi justificada anteriormente',
      );
    }

    if (frequencia.status !== StatusFrequencia.FALTA) {
      throw new BadRequestException(
        'Apenas frequências com status FALTA podem ser justificadas',
      );
    }

    if (user.role === Role.PROFESSOR) {
      const professor = await this.findProfessorByUsuarioId(user.id);
      if (!professor) {
        throw new ForbiddenException('Professor não encontrado');
      }

      const autorizado = await this.professorMinistraDisciplina(
        professor,
        frequencia.disciplina.id_disciplina,
      );

      if (!autorizado) {
        throw new ForbiddenException(
          'Professor não autorizado para justificar falta nesta disciplina',
        );
      }
    }

    const documentacao = await this.documentacaoRepository.findOne({
      where: { aluno: { id: frequencia.aluno.id } as any },
    });

    if (!documentacao) {
      throw new NotFoundException('Documentação do aluno não encontrada');
    }

    const justificativaExistente = await this.documentoRepository.findOne({
      where: {
        documentacao: { id: documentacao.id } as any,
        tipo: TipoDocumento.JUSTIFICATIVA_FALTA,
      },
    });

    if (justificativaExistente) {
      throw new BadRequestException(
        'Já existe uma justificativa cadastrada para esta falta',
      );
    }

    const documento = this.documentoRepository.create({
      tipo: TipoDocumento.JUSTIFICATIVA_FALTA,
      nomeOriginal: arquivo.originalname,
      nomeArquivo: arquivo.filename,
      caminho: arquivo.path,
      mimeType: arquivo.mimetype,
      tamanho: arquivo.size,
      documentacao,
    });

    await this.documentoRepository.save(documento);

    frequencia.status = StatusFrequencia.FALTA_JUSTIFICADA;
    await this.frequenciaRepository.save(frequencia);

    return { message: 'Justificativa anexada com sucesso' };
  }


}