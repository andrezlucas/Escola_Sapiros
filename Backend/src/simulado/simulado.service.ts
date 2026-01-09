import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { Simulado } from './entities/simulado.entity';
import { Questao } from '../atividade/entities/questao.entity';
import { Alternativa } from '../atividade/entities/alternativa.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Habilidade } from '../disciplina/entities/habilidade.entity';
import { CreateSimuladoDto } from './dto/create-simulado.dto';
import { IaQuestoesService } from 'src/ia/ia-questoes.service';
import { GerarQuestoesIaDto } from '../atividade/dto/gerar-questoes-ia.dto';
import { UpdateSimuladoDto } from './dto/update-simulado.dto';
import { CreateQuestaoDto } from '../atividade/dto/create-questao.dto';
import { UpdateQuestaoDto } from '../atividade/dto/update-questao.dto';
import { TentativaSimulado } from './entities/tentativa-simulado.entity';
import { Aluno } from '../aluno/entities/aluno.entity';

@Injectable()
export class SimuladoService {
  constructor(
    @InjectRepository(Simulado)
    private readonly simuladoRepository: Repository<Simulado>,
    @InjectRepository(Disciplina)
    private readonly disciplinaRepository: Repository<Disciplina>,
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,
    @InjectRepository(TentativaSimulado)
    private readonly tentativaRepository: Repository<TentativaSimulado>,
    private readonly dataSource: DataSource,
    private readonly iaQuestoesService: IaQuestoesService,
  ) {}

  async create(dto: CreateSimuladoDto, professorId: string) {
    const disciplina = await this.disciplinaRepository.findOne({
      where: { id_disciplina: dto.disciplinaId, professores: { id: professorId } },
    });

    if (!disciplina) throw new ForbiddenException('Disciplina não vinculada ao professor');

    const turmas = await this.turmaRepository.find({
      where: { id: In(dto.turmaIds), professor: { id: professorId } },
    });

    if (turmas.length !== dto.turmaIds.length) throw new ForbiddenException('Acesso negado a uma ou mais turmas');

    return this.dataSource.transaction(async (manager) => {
      const valorTotal = dto.questoes.reduce((acc, q) => acc + (Number(q.valor) || 0), 0);

      const simulado = manager.create(Simulado, {
        titulo: dto.titulo,
        bimestre: dto.bimestre,
        dataInicio: new Date(dto.dataInicio),
        dataFim: new Date(dto.dataFim),
        tempoDuracao: dto.tempoDuracao,
        valorTotal,
        disciplina,
        turmas,
        professor: { id: professorId },
      });

      const simuladoSalvo = await manager.save(simulado);

      for (const qDto of dto.questoes) {
        const habilidades = qDto.habilidadesIds?.length
          ? await manager.find(Habilidade, { where: { id: In(qDto.habilidadesIds) } })
          : [];

        const questao = manager.create(Questao, {
          enunciado: qDto.enunciado,
          tipo: qDto.tipo,
          valor: qDto.valor,
          simulado: simuladoSalvo,
          habilidades,
        });

        const questaoSalva = await manager.save(questao);

        if (qDto.alternativas?.length) {
          const alternativas = qDto.alternativas.map((alt, index) =>
            manager.create(Alternativa, {
              texto: alt.texto,
              correta: alt.correta,
              letra: alt.letra ?? String.fromCharCode(65 + index),
              questao: questaoSalva,
            }),
          );
          await manager.save(alternativas);
        }
      }

      return manager.findOne(Simulado, {
        where: { id: simuladoSalvo.id },
        relations: ['disciplina', 'turmas', 'questoes', 'questoes.alternativas', 'questoes.habilidades'],
      });
    });
  }

  async findOne(id: string) {
    const simulado = await this.simuladoRepository.findOne({
      where: { id },
      relations: ['disciplina', 'turmas', 'questoes', 'questoes.alternativas', 'questoes.habilidades'],
    });
    if (!simulado) throw new NotFoundException('Simulado não encontrado');
    return simulado;
  }

  async findAllByProfessor(professorId: string) {
    return this.simuladoRepository.find({
      where: { professor: { id: professorId } },
      relations: ['disciplina', 'turmas'],
      order: { criadoem: 'DESC' } as any,
    });
  }

  async remove(id: string, professorId: string) {
    const simulado = await this.simuladoRepository.findOne({
      where: { id, professor: { id: professorId } }
    });
    if (!simulado) throw new ForbiddenException('Simulado não encontrado ou sem permissão');
    await this.simuladoRepository.remove(simulado);
    return { message: 'Simulado removido' };
  }

  async gerarQuestoesIa(dto: GerarQuestoesIaDto, professorId: string) {
    const disciplina = await this.disciplinaRepository.findOne({
      where: { id_disciplina: dto.disciplinaId, professores: { id: professorId } },
    });

    if (!disciplina) throw new ForbiddenException('Disciplina inválida');

    const habilidades = dto.habilidadesIds?.length
      ? await this.dataSource.getRepository(Habilidade).find({ where: { id: In(dto.habilidadesIds) } })
      : [];

    const resultado = await this.iaQuestoesService.gerarQuestoes({
      disciplina: disciplina.nome_disciplina,
      tema: dto.tema,
      habilidades,
      quantidade: dto.quantidade,
      tipos: dto.tipos,
    });

    return {
      questoes: resultado.questoes.map((q) => ({
        enunciado: q.enunciado,
        tipo: q.tipo,
        valor: q.valor ?? 1,
        alternativas: q.alternativas ?? [],
        habilidades: habilidades.map(h => ({ id: h.id, nome: h.nome }))
      })),
    };
  }

  async update(id: string, dto: UpdateSimuladoDto, professorId: string) {
    const simulado = await this.simuladoRepository.findOne({
      where: { id, professor: { id: professorId } },
    });

    if (!simulado) {
      throw new NotFoundException('Simulado não encontrado');
    }

    if (dto.dataInicio) dto.dataInicio = new Date(dto.dataInicio);
    if (dto.dataFim) dto.dataFim = new Date(dto.dataFim);

    const { questoes, ...dadosSimulado } = dto;
    this.simuladoRepository.merge(simulado, dadosSimulado);

    return this.simuladoRepository.save(simulado);
  }

  async patchQuestao(
    simuladoId: string,
    questaoId: string,
    dto: UpdateQuestaoDto,
    professorId: string,
  ) {
    const simulado = await this.simuladoRepository.findOne({
      where: { id: simuladoId, professor: { id: professorId } },
    });

    if (!simulado) {
      throw new ForbiddenException('Simulado não encontrado');
    }

    const questao = await this.dataSource.getRepository(Questao).findOne({
      where: { id: questaoId, simulado: { id: simuladoId } },
      relations: ['alternativas', 'habilidades'],
    });

    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    return this.dataSource.transaction(async (manager) => {
      if (dto.enunciado !== undefined) questao.enunciado = dto.enunciado;
      if (dto.valor !== undefined) questao.valor = dto.valor;
      if (dto.tipo !== undefined) questao.tipo = dto.tipo;

      if (dto.habilidadesIds) {
        questao.habilidades = await manager.find(Habilidade, {
          where: { id: In(dto.habilidadesIds) },
        });
      }

      await manager.save(questao);

      if (dto.alternativas && questao.tipo !== 'DISSERTATIVA') {
        await manager.remove(questao.alternativas);

        const novasAlternativas = dto.alternativas.map((alt, index) =>
          manager.create(Alternativa, {
            texto: alt.texto,
            correta: alt.correta,
            letra: alt.letra ?? String.fromCharCode(65 + index),
            questao,
          }),
        );

        await manager.save(novasAlternativas);
      }

      const questaoAtualizada = await manager.findOne(Questao, {
        where: { id: questaoId },
        relations: ['alternativas', 'habilidades'],
      });

      const todasQuestoes = await manager.find(Questao, {
        where: { simulado: { id: simuladoId } }
      });
      const novoValorTotal = todasQuestoes.reduce((acc, q) => acc + Number(q.valor), 0);
      await manager.update(Simulado, simuladoId, { valorTotal: novoValorTotal });

      return questaoAtualizada;
    });
  }

  async adicionarQuestao(
    simuladoId: string,
    dto: CreateQuestaoDto,
    professorId: string,
  ) {
    const simulado = await this.simuladoRepository.findOne({
      where: { id: simuladoId, professor: { id: professorId } },
    });

    if (!simulado) {
      throw new ForbiddenException('Simulado não encontrado');
    }

    return this.dataSource.transaction(async (manager) => {
      const habilidades = dto.habilidadesIds?.length
        ? await manager.find(Habilidade, { where: { id: In(dto.habilidadesIds) } })
        : [];

      const questao = manager.create(Questao, {
        enunciado: dto.enunciado,
        tipo: dto.tipo,
        valor: dto.valor,
        simulado,
        habilidades,
      });

      const questaoSalva = await manager.save(questao);

      if (dto.tipo !== 'DISSERTATIVA' && dto.alternativas?.length) {
        const alternativas = dto.alternativas.map((alt, index) =>
          manager.create(Alternativa, {
            texto: alt.texto,
            correta: alt.correta,
            letra: alt.letra ?? String.fromCharCode(65 + index),
            questao: questaoSalva,
          }),
        );
        await manager.save(alternativas);
      }

      const todasQuestoes = await manager.find(Questao, {
        where: { simulado: { id: simuladoId } }
      });
      const novoValorTotal = todasQuestoes.reduce((acc, q) => acc + Number(q.valor), 0);
      await manager.update(Simulado, simuladoId, { valorTotal: novoValorTotal });

      return manager.findOne(Questao, {
        where: { id: questaoSalva.id },
        relations: ['alternativas', 'habilidades'],
      });
    });
  }

  async removerQuestao(
    simuladoId: string,
    questaoId: string,
    professorId: string,
  ) {
    const simulado = await this.simuladoRepository.findOne({
      where: { id: simuladoId, professor: { id: professorId } },
      relations: ['questoes'],
    });

    if (!simulado) {
      throw new ForbiddenException('Simulado não encontrado');
    }

    const questao = simulado.questoes.find((q) => q.id === questaoId);
    if (!questao) {
      throw new NotFoundException('Questão não encontrada');
    }

    await this.dataSource.getRepository(Questao).remove(questao);

    const novoValorTotal = Number(simulado.valorTotal) - Number(questao.valor);
    await this.simuladoRepository.update(simuladoId, { valorTotal: novoValorTotal });

    return { message: 'Questão removida com sucesso' };
  }

  async findByTurma(turmaId: string) {
    return this.simuladoRepository
      .createQueryBuilder('simulado')
      .innerJoin('simulado.turmas', 'turma')
      .where('turma.id = :turmaId', { turmaId })
      .leftJoinAndSelect('simulado.disciplina', 'disciplina')
      .andWhere('simulado.ativo = :ativa', { ativa: true })
      .orderBy('simulado.dataInicio', 'ASC')
      .getMany();
  }

 async iniciarSimulado(simuladoId: string, usuarioId: string) { 
  const aluno = await this.buscarTurmaDoAluno(usuarioId); 
  const simulado = await this.simuladoRepository.findOne({ where: { id: simuladoId }, relations: ['turmas'] });
   if (!simulado) throw new NotFoundException('Simulado não encontrado'); 
   const agora = new Date();
    if (agora > simulado.dataFim && simulado.ativo) { 
      simulado.ativo = false; await this.simuladoRepository.save(simulado); } 
      if (!simulado.ativo || agora < simulado.dataInicio || agora > simulado.dataFim) { 
        throw new ForbiddenException('Este simulado não está disponível no momento'); } 
        const tentativaExistente = await this.tentativaRepository.findOne({ where: 
          { aluno: { id: aluno.id }, simulado: { id: simulado.id } } });
           if (tentativaExistente) 
            return tentativaExistente;
           const fimPrevisto = new Date(agora.getTime() + simulado.tempoDuracao * 60000); 
           const tentativa = this.tentativaRepository.create({ inicioEm: agora, fimPrevisto, aluno: 
            { id: aluno.id }, simulado: { id: simulado.id }, }); 
            return this.tentativaRepository.save(tentativa); }

  async finalizarSimulado(simuladoId: string, dto: any, usuarioId: string) {
    const aluno = await this.buscarTurmaDoAluno(usuarioId);
    const tentativa = await this.tentativaRepository.findOne({
      where: { simulado: { id: simuladoId }, aluno: { id: aluno.id } },
      relations: ['simulado', 'simulado.questoes', 'simulado.questoes.alternativas']
    });

    if (!tentativa) throw new ForbiddenException('Nenhuma tentativa iniciada');
    if (tentativa.entregueEm) throw new ForbiddenException('Simulado já entregue');

    const agora = new Date();
    // Margem de segurança de 2 minutos para atraso de rede
    const limiteComTolerancia = new Date(tentativa.fimPrevisto.getTime() + 120000);

    if (agora > limiteComTolerancia) {
      throw new ForbiddenException('Tempo limite excedido');
    }

    return this.dataSource.transaction(async (manager) => {
      let notaAcumulada = 0;

      // Lógica de correção automática (reaproveitando sua lógica de atividade)
      for (const resp of dto.respostas) {
        const questao = tentativa.simulado.questoes.find(q => q.id === resp.questaoId);
        if (!questao) continue;

        const correta = questao.alternativas.find(a => a.id === resp.alternativaId && a.correta);
        if (correta) notaAcumulada += Number(questao.valor);
      }

      tentativa.entregueEm = agora;
      tentativa.notaFinal = notaAcumulada;

      return await manager.save(tentativa);
    });
  }

  async buscarTentativa(id: string) {
    const tentativa = await this.tentativaRepository.findOne({
      where: { id },
      relations: ['simulado', 'aluno', 'aluno.usuario']
    });
    if (!tentativa) throw new NotFoundException('Tentativa não encontrada');
    return tentativa;
  }

  private async buscarTurmaDoAluno(usuarioId: string) {
  const alunoObj = await this.dataSource.getRepository(Aluno).findOne({
    where: { usuario: { id: usuarioId } },
    relations: ['turma'],
  });

  if (!alunoObj) {
    throw new NotFoundException('Aluno não encontrado');
  }

  return alunoObj;
}

async arquivar(id: string, professorId: string) {
  const simulado = await this.simuladoRepository.findOne({
    where: { id, professor: { id: professorId } },
  });

  if (!simulado) throw new ForbiddenException('Simulado não encontrado ou sem permissão');

  simulado.ativo = false;
  await this.simuladoRepository.save(simulado);

  return { message: 'Simulado arquivado com sucesso' };
}


}