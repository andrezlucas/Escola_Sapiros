import { Injectable, BadRequestException } from '@nestjs/common';
import { IntentIA } from './ia-query.types';
import { IaQueryDbService } from './ia-query-db.service';

@Injectable()
export class IaQueryMapperService {
  constructor(private readonly db: IaQueryDbService) {}

  executar(intent: IntentIA) {
    const filtros = intent.filtros;

    if (!filtros?.alunoId) {
      throw new BadRequestException('Aluno não identificado na pergunta');
    }

    const alunoId = filtros.alunoId;

    switch (intent.entidade) {
      case 'habilidade':
        return this.db.habilidadeMaisForte(alunoId);

      case 'nota':
        if (intent.acao === 'media') {
          return this.db.mediaGeral(alunoId);
        }

        if (intent.acao === 'menor_desempenho') {
          return this.db.disciplinaPiorDesempenho(alunoId);
        }
        break;

      case 'frequencia':
        if (!filtros.data) {
          throw new BadRequestException(
            'Data não informada para consulta de frequência',
          );
        }

        return this.db.frequenciaPorData(alunoId, filtros.data);

      case 'atividade':
        return this.db.atividadesPendentes(alunoId);

      case 'simulado':
        return this.db.quantidadeSimulados(alunoId);
    }

    throw new BadRequestException('Intenção não suportada');
  }


}
