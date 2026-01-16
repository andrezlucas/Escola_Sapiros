import { Injectable } from '@nestjs/common';
import { IaSimpleService } from '../ia/ia-simple.service';
import { IntentIA } from './ia-query.types';

@Injectable()
export class IaQueryIntentService {
  constructor(private readonly ia: IaSimpleService) {}

  async interpretar(pergunta: string): Promise<IntentIA> {
    const resposta = await this.ia.processarComando(
      pergunta,
      this.systemPrompt(),
    );

    return JSON.parse(resposta);
  }

  private systemPrompt(): string {
    return `
Você interpreta perguntas educacionais e retorna JSON estruturado + explicação breve.

Entidades:
aluno, nota, frequencia, habilidade, atividade, simulado, disciplina

Ações:
media, maior_facilidade, menor_desempenho,
buscar_por_data, buscar_por_periodo,
pendencias, quantidade

Regras:
- Retorne JSON válido
-  explique minimamente
- Não invente campos
`;
  }
}
