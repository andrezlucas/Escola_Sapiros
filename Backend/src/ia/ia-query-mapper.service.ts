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
        if (intent.acao === 'media_geral') {
          return this.db.mediaGeral(alunoId);
        }

        if (intent.acao === 'pior_disciplina') {
          return this.db.disciplinaPiorDesempenho(alunoId);
        }

        if (intent.acao === 'melhor_disciplina') {
          return this.db.habilidadeMaisForte(alunoId);
        }

        throw new BadRequestException('Ação inválida para nota');

      case 'frequencia':
        if (intent.acao !== 'buscar_por_data' && intent.acao !== 'consultar') {
          throw new BadRequestException('Ação inválida para frequência');
        }

        if (!filtros.data) {
          throw new BadRequestException('Data obrigatória');
        }

        return this.db.frequenciaPorData(alunoId, filtros.data);

      case 'atividade':
        if (intent.acao !== 'pendencias' && intent.acao !== 'consultar') {
          throw new BadRequestException('Ação inválida para atividade');
        }

        return this.db.atividadesPendentes(alunoId);

      case 'simulado':
        if (intent.acao !== 'quantidade' && intent.acao !== 'consultar') {
          throw new BadRequestException('Ação inválida para simulado');
        }

        return this.db.quantidadeSimulados(alunoId);

      case 'habilidade':
        return this.db.habilidadeMaisForte(alunoId);

      default:
        throw new BadRequestException(`Entidade inválida: ${intent.entidade}`);
    }
  }
}
