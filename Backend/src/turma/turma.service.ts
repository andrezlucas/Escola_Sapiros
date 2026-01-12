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
import { TurmaDashboardDto } from './dto/turma-dashboard.dto';
import { TurmaGraficoAlunosDto } from './dto/turma-grafico-alunos.dto';
import { Habilidade } from 'src/disciplina/entities/habilidade.entity';
import { Nota } from 'src/nota/entities/nota.entity';
import { DashboardResumoDto, DashboardEvolucaoDto, DashboardAlunoDto, DashboardHabilidadeDto, HabilidadeDestaqueDto } from './dto/dashboard-pedagogico.dto';
import { Atividade } from 'src/atividade/entities/atividade.entity';
import { Entrega } from 'src/atividade/entities/entrega.entity';
import { Bimestre } from 'src/shared/enums/bimestre.enum';


@Injectable()
export class TurmaService {
  constructor(
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,

    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,

    @InjectRepository(Habilidade)
    private readonly habilidadeRepository: Repository<Habilidade>,

    @InjectRepository(Atividade)
    private readonly atividadeRepository: Repository<Atividade>,

    @InjectRepository(Entrega)
    private readonly entregaRepository: Repository<Entrega>,

    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
  ) {}

  private validarUsuarioBloqueado(
    usuario: Usuario,
    tipo: 'Aluno' | 'Professor',
  ) {
    if (usuario.isBlocked) {
      throw new ForbiddenException(`${tipo} ${usuario.nome} está bloqueado(a)`);
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

    alunos.forEach((aluno) =>
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
    turma.capacidade_maxima = dto.capacidade_maxima ?? turma.capacidade_maxima;
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

    await this.turmaRepository.save(turma);

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

    await this.alunoRepository
      .createQueryBuilder()
      .update(Aluno)
      .set({ turma: null as any })
      .where('id = :id', { id: alunoId })
      .execute();

    return this.findOne(turmaId);
  }

  async definirProfessor(turmaId: string, professorId: string): Promise<Turma> {
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

  async getDashboard(): Promise<TurmaDashboardDto> {
    const turmas = await this.turmaRepository.find({
      where: { ativa: true },
      relations: ['alunos'],
      order: { nome_turma: 'ASC' },
    });

    let totalAlunos = 0;
    let totalCapacidade = 0;

    const graficoAlunosPorTurma: TurmaGraficoAlunosDto[] = turmas.map(
      (turma) => {
        const qtdAlunos = turma.alunos?.length ?? 0;

        totalAlunos += qtdAlunos;

        if (turma.capacidade_maxima) {
          totalCapacidade += turma.capacidade_maxima;
        }

        return {
          turmaId: turma.id,
          nomeTurma: turma.nome_turma,
          totalAlunos: qtdAlunos,
          capacidadeMaxima: turma.capacidade_maxima ?? null,
        };
      },
    );

    const taxaOcupacaoGeral =
      totalCapacidade > 0
        ? Number(((totalAlunos / totalCapacidade) * 100).toFixed(1))
        : 0;

    return {
      graficoAlunosPorTurma,
      indicadores: {
        taxaOcupacaoGeral,
        totalTurmasAtivas: turmas.length,
        totalAlunos,
      },
    };
  }
async getDashboardResumo(turmaId: string): Promise<DashboardResumoDto> {
    const turma = await this.turmaRepository.findOne({
      where: { id: turmaId },
      relations: ['alunos', 'alunos.notas'],
    });

    if (!turma) throw new NotFoundException('Turma não encontrada');

    let somaMediasTurma = 0;
    let countAlunosComNota = 0;
    let alunosEmRisco = 0;

    for (const aluno of turma.alunos) {
      const mediaAluno = this.calcularMediaAluno(aluno.notas);
      
      if (mediaAluno !== null) {
        somaMediasTurma += mediaAluno;
        countAlunosComNota++;
        
        if (mediaAluno < 6.0) {
          alunosEmRisco++;
        }
      }
    }

    const mediaGeral = countAlunosComNota > 0 
      ? Number((somaMediasTurma / countAlunosComNota).toFixed(1)) 
      : 0;

    const competencias = await this.calcularStatsHabilidades(turmaId);
    const melhor = competencias.sort((a, b) => b.media - a.media)[0];

    return {
      mediaGeral,
      tendencia: 'up',
      melhorCompetencia: {
        nome: melhor ? melhor.habilidade : 'N/A',
        percentual: melhor ? melhor.media : 0,
      },
      alunosEmRisco,
    };
  }

  async getDashboardEvolucao(
    turmaId: string, 
    periodo: 'bimestral' | 'trimestral' | 'semestral'
  ): Promise<DashboardEvolucaoDto[]> {
    
    if (periodo === 'bimestral') {
      return this.calcularEvolucaoBimestral(turmaId);
    }

    const mesesAtras = periodo === 'trimestral' ? 3 : 6;
    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - mesesAtras);

    return this.calcularEvolucaoSemanal(turmaId, dataLimite);
  }

  private async calcularEvolucaoBimestral(turmaId: string): Promise<DashboardEvolucaoDto[]> {
    const atividades = await this.atividadeRepository.find({
      where: { turmas: { id: turmaId }, ativa: true },
    });

    const mapaBimestres = [
      { enum: Bimestre.PRIMEIRO, label: '1º Bim' },
      { enum: Bimestre.SEGUNDO, label: '2º Bim' },
      { enum: Bimestre.TERCEIRO, label: '3º Bim' },
      { enum: Bimestre.QUARTO, label: '4º Bim' },
    ];

    const resultado: DashboardEvolucaoDto[] = [];

    for (const b of mapaBimestres) {
      const atividadesBimestre = atividades.filter(a => a.bimestre === b.enum);
      
      if (atividadesBimestre.length === 0) {
        continue; 
      }

      let somaNotas = 0;
      let totalEntregas = 0;

      for (const atv of atividadesBimestre) {
        const entregas = await this.entregaRepository.find({
          where: { atividade: { id: atv.id } }
        });
        
        if (entregas.length > 0) {
           const somaAtividade = entregas.reduce((acc, e) => acc + Number(e.notaFinal), 0);
           const mediaAtividade = (somaAtividade / entregas.length);
           const mediaNormalizada = atv.valor > 0 ? (mediaAtividade / atv.valor) * 10 : 0;
           
           somaNotas += mediaNormalizada;
           totalEntregas++;
        }
      }

      if (totalEntregas > 0) {
        resultado.push({
          semana: b.label, 
          media: Number((somaNotas / totalEntregas).toFixed(1))
        });
      }
    }

    if (resultado.length === 0) {
        return [
            { semana: '1º Bim', media: 0 }, 
            { semana: '2º Bim', media: 0 }
        ];
    }

    return resultado;
  }

  private async calcularEvolucaoSemanal(turmaId: string, dataLimite: Date): Promise<DashboardEvolucaoDto[]> {
    const atividades = await this.atividadeRepository
      .createQueryBuilder('atividade')
      .innerJoin('atividade.turmas', 'turma')
      .where('turma.id = :turmaId', { turmaId })
      .andWhere('atividade.ativa = :ativa', { ativa: true })
      .andWhere('atividade.dataEntrega >= :dataLimite', { dataLimite })
      .orderBy('atividade.dataEntrega', 'ASC')
      .getMany();

    const evolucao: DashboardEvolucaoDto[] = [];

    for (const atv of atividades) {
      const entregas = await this.entregaRepository.find({
        where: { atividade: { id: atv.id } },
      });

      if (entregas.length > 0) {
        const soma = entregas.reduce((acc, e) => acc + Number(e.notaFinal), 0);
        let mediaBruta = soma / entregas.length;

        if (atv.valor > 0 && atv.valor !== 10) {
          mediaBruta = (mediaBruta / atv.valor) * 10;
        }

        const dataLabel = new Date(atv.dataEntrega).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        });

        evolucao.push({
          semana: dataLabel,
          media: Number(mediaBruta.toFixed(1)),
        });
      }
    }
    
    if (evolucao.length === 0) return [{ semana: 'Inicio', media: 0 }];

    return evolucao;
  }

  async getDashboardAlunos(turmaId: string): Promise<DashboardAlunoDto[]> {
    const turma = await this.turmaRepository.findOne({
      where: { id: turmaId },
      relations: ['alunos', 'alunos.usuario', 'alunos.notas'],
      order: { alunos: { usuario: { nome: 'ASC' } } } as any
    });

    if (!turma) throw new NotFoundException('Turma não encontrada');

    return turma.alunos.map((aluno) => {
      const media = this.calcularMediaAluno(aluno.notas) || 0;

      let status: 'ATENCAO' | 'REGULAR' | 'BOM' = 'REGULAR';
      if (media < 6.0) status = 'ATENCAO';
      if (media >= 8.0) status = 'BOM';

      return {
        id: aluno.id,
        nome: aluno.usuario.nome,
        matricula: aluno.matriculaAluno,
        desempenhoGeral: media,
        status,
      };
    });
  }

 async getDashboardCompetencias(
  turmaId: string,
): Promise<DashboardHabilidadeDto[]> {
  return this.calcularStatsHabilidades(turmaId);
}


  private calcularMediaAluno(notas: Nota[]): number | null {
    if (!notas || notas.length === 0) return null;

    const valoresValidos: number[] = [];

    notas.forEach((n) => {
      if (n.nota1 !== null && n.nota1 !== undefined) valoresValidos.push(Number(n.nota1));
      if (n.nota2 !== null && n.nota2 !== undefined) valoresValidos.push(Number(n.nota2));
    });

    if (valoresValidos.length === 0) return null;

    const soma = valoresValidos.reduce((acc, val) => acc + val, 0);
    return Number((soma / valoresValidos.length).toFixed(1));
  }

private async calcularStatsHabilidades(
  turmaId: string,
): Promise<DashboardHabilidadeDto[]> {

  const stats: Record<string, { soma: number; count: number }> = {};
  const habilidadesIds = new Set<string>();

  const notas = await this.notaRepository.find({
    where: {
      aluno: { turma: { id: turmaId } },
    },
  });

  for (const nota of notas) {
    if (nota.nota1 && Array.isArray(nota.habilidades1)) {
      for (const hId of nota.habilidades1) {
        habilidadesIds.add(hId);
        stats[hId] ??= { soma: 0, count: 0 };
        stats[hId].soma += Number(nota.nota1);
        stats[hId].count += 1;
      }
    }

    if (nota.nota2 && Array.isArray(nota.habilidades2)) {
      for (const hId of nota.habilidades2) {
        habilidadesIds.add(hId);
        stats[hId] ??= { soma: 0, count: 0 };
        stats[hId].soma += Number(nota.nota2);
        stats[hId].count += 1;
      }
    }
  }

  const atividades = await this.atividadeRepository.find({
    where: {
      turmas: { id: turmaId },
      ativa: true,
    },
    relations: ['questoes', 'questoes.habilidades'],
  });

  for (const atividade of atividades) {
    if (!atividade.questoes?.length) continue;

    const habilidadesAtividade = new Set<string>();

    for (const questao of atividade.questoes) {
      questao.habilidades?.forEach(h => habilidadesAtividade.add(h.id));
    }

    if (!habilidadesAtividade.size) continue;

    const entregas = await this.entregaRepository.find({
      where: { atividade: { id: atividade.id } },
    });

    if (!entregas.length) continue;

    const valorMaximo =
      atividade.valor && Number(atividade.valor) > 0
        ? Number(atividade.valor)
        : 10;

    for (const entrega of entregas) {
      if (entrega.notaFinal == null) continue;

      const notaNormalizada =
        (Number(entrega.notaFinal) / valorMaximo) * 10;

      for (const hId of habilidadesAtividade) {
        habilidadesIds.add(hId);
        stats[hId] ??= { soma: 0, count: 0 };
        stats[hId].soma += notaNormalizada;
        stats[hId].count += 1;
      }
    }
  }

  if (!habilidadesIds.size) return [];

  const habilidades = await this.habilidadeRepository.find({
    where: { id: In([...habilidadesIds]) },
  });

  const mapaNomes = new Map(habilidades.map(h => [h.id, h.nome]));

  return Object.entries(stats).map(([habilidadeId, dados]) => {
    const media10 = dados.soma / dados.count;
    const percentual = Math.round(media10 * 10);

    let status: 'BOM' | 'ATENCAO' | 'CRITICO';

    if (percentual >= 80) status = 'BOM';
    else if (percentual < 60) status = 'CRITICO';
    else status = 'ATENCAO';

    return {
      habilidade: mapaNomes.get(habilidadeId) ?? 'Habilidade',
      media: percentual,
      status,
    };
  });
}

  async getHabilidadesCriticasProfessor(usuarioId: string): Promise<HabilidadeDestaqueDto[]> {
    const professor = await this.professorRepository.findOne({
      where: { usuario: { id: usuarioId } },
    });
    if (!professor) return [];

    const stats: Record<string, { soma: number; count: number }> = {};
    const habilidadesIds = new Set<string>();

    const notasProfessor = await this.notaRepository.find({
      where: { professor: { id: professor.id } },
    });

    notasProfessor.forEach((nota) => {
        const computarNota = (habs: any[], valor: number) => {
            if (habs && Array.isArray(habs) && valor !== null) {
                habs.forEach((hId) => {
                    habilidadesIds.add(hId);
                    if (!stats[hId]) stats[hId] = { soma: 0, count: 0 };
                    stats[hId].soma += Number(valor);
                    stats[hId].count += 1;
                });
            }
        };
        computarNota(nota.habilidades1, Number(nota.nota1));
        computarNota(nota.habilidades2, Number(nota.nota2));
    });

    const atividadesProfessor = await this.atividadeRepository.find({
        where: { professor: { id: professor.id }, ativa: true }, 
        relations: ['questoes', 'questoes.habilidades'] 
    });

    for (const atv of atividadesProfessor) {
        if (!atv.questoes || atv.questoes.length === 0) continue;

        const habilidadesDaAtividade = new Set<string>();
        atv.questoes.forEach((q) => {
            if (q.habilidades && Array.isArray(q.habilidades)) {
                q.habilidades.forEach(h => habilidadesDaAtividade.add(h.id));
            }
        });

        if (habilidadesDaAtividade.size === 0) continue;

        const entregas = await this.entregaRepository.find({
            where: { atividade: { id: atv.id } }
        });

        const valorAtividade = Number(atv.valor);
        const valorMaximo = valorAtividade > 0 ? valorAtividade : 10;

        for (const entrega of entregas) {
            if (entrega.notaFinal === null || entrega.notaFinal === undefined) continue;

            const notaNormalizada = (Number(entrega.notaFinal) / valorMaximo) * 10;

            habilidadesDaAtividade.forEach(hId => {
                habilidadesIds.add(hId);
                if (!stats[hId]) stats[hId] = { soma: 0, count: 0 };
                stats[hId].soma += notaNormalizada;
                stats[hId].count += 1;
            });
        }
    }

    const idsArray = Array.from(habilidadesIds);
    if (idsArray.length === 0) return [];

    const habilidadesDb = await this.habilidadeRepository.find({ where: { id: In(idsArray) } });
    const mapaNomes = new Map(habilidadesDb.map((h) => [h.id, h.nome]));

    const resultado: HabilidadeDestaqueDto[] = [];

    Object.entries(stats).forEach(([id, dados]) => {
      const media = dados.soma / dados.count;
      const percentual = media <= 10 ? media * 10 : media;

      if (percentual < 70) {
        resultado.push({
          habilidade: mapaNomes.get(id) || 'Geral',
          media: Math.round(percentual),
          status: percentual < 50 ? 'CRITICO' : 'ATENCAO',
        });
      }
    });

    return resultado.sort((a, b) => a.media - b.media).slice(0, 4);
  }
 
}
