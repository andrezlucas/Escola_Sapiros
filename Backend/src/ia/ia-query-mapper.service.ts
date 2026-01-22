import { BadRequestException, Injectable } from '@nestjs/common';
import { IntentIA } from './ia-query.types';
import { IaQueryDbService } from './ia-query-db.service';

@Injectable()
export class IaQueryMapperService {
  constructor(private readonly db: IaQueryDbService) {}

  async executar(intent: IntentIA) {
    if (!intent.entidade || !intent.acao) {
      throw new BadRequestException('Não foi possível interpretar a pergunta');
    }

    const filtros = intent.filtros ?? {};

    let alunoId = filtros.alunoId;

    if (!alunoId && filtros.nomeAluno) {
      const aluno = await this.db.buscarAlunoPorNome(filtros.nomeAluno);

      if (!aluno) {
        throw new BadRequestException('Aluno não encontrado');
      }

      alunoId = aluno.id;
    }

    if (!alunoId) {
      throw new BadRequestException('Aluno não identificado');
    }

    switch (intent.entidade) {
      case 'nota':
        switch (intent.acao) {
          case 'media_geral':
            return this.db.mediaGeral(alunoId);

          case 'pior_disciplina':
            return this.db.disciplinaPiorDesempenho(alunoId);

          case 'melhor_disciplina':
            return this.db.habilidadeMaisForte(alunoId);

          case 'ranking':
            return this.db.rankingDisciplinas(alunoId);
        }
        break;

      case 'frequencia':
        if (!filtros.data) {
          throw new BadRequestException('Data obrigatória');
        }
        return this.db.frequenciaPorData(alunoId, filtros.data);

      case 'atividade':
        return this.db.atividadesPendentes(alunoId);

      case 'simulado':
        return this.db.quantidadeSimulados(alunoId);

      case 'habilidade':
        return this.db.habilidadeMaisForte(alunoId);

      case 'ia':
        switch (intent.acao) {
          case 'score':
            return this.db.scoreCognitivo(alunoId);

          case 'disciplinas_criticas':
            return this.db.disciplinasCriticas(alunoId);

          case 'sugestao_reforco':
            return this.db.sugestaoReforco(alunoId);

          case 'evolucao':
            return this.db.evolucaoDesempenho(alunoId);
        }
        break;
    }

    throw new BadRequestException(
      `Combinação inválida: ${intent.entidade} → ${intent.acao}`,
    );
  }
}
