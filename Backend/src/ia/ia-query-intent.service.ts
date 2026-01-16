import { Injectable, BadRequestException } from '@nestjs/common';
import { IaSimpleService } from './ia-simple.service';
import { IntentIA } from './ia-query.types';

@Injectable()
export class IaQueryIntentService {
  constructor(private readonly ia: IaSimpleService) {}

  async interpretar(pergunta: string): Promise<IntentIA> {
    const resposta = await this.ia.processarComando(
      pergunta,
      this.systemPrompt(),
    );

    try {
      const intent = JSON.parse(resposta);

      if (!intent.entidade || !intent.acao) {
        throw new Error('JSON incompleto');
      }

      return intent;
    } catch (error) {
      throw new BadRequestException('Não foi possível interpretar a pergunta');
    }
  }

  private systemPrompt(): string {
    return `
Você converte perguntas educacionais em JSON para consultas em banco de dados.

RETORNE APENAS JSON VÁLIDO. NÃO explique nada.

Entidades possíveis:
- nota
- frequencia
- atividade
- simulado
- habilidade

Ações possíveis:
- media_geral
- pior_disciplina
- melhor_disciplina
- buscar_por_data
- pendencias
- quantidade
- consultar

Formato obrigatório:
{
  "entidade": "nota | frequencia | atividade | simulado | habilidade",
  "acao": "media_geral | pior_disciplina | melhor_disciplina | buscar_por_data | pendencias | quantidade | consultar",
  "filtros": {
    "nomeAluno"?: string,
    "data"?: string
  }
}

Regras de interpretação:

- "média", "média geral", "nota geral" → entidade: nota, ação: media_geral
- "pior", "abaixo", "precisa melhorar", "menor nota" → pior_disciplina
- "melhor", "mais forte", "se destaca", "maior nota" → melhor_disciplina

- Perguntas sobre presença ou falta em uma data:
  → entidade: frequencia
  → ação: buscar_por_data
  → extraia a data no formato YYYY-MM-DD

- Perguntas sobre atividades não entregues:
  → entidade: atividade
  → ação: pendencias

- Perguntas sobre quantidade de simulados:
  → entidade: simulado
  → ação: quantidade

- Perguntas sobre habilidade principal, ponto forte ou destaque:
  → entidade: habilidade
  → ação: consultar

- Sempre que um aluno for citado, extraia o nome completo em "nomeAluno".

Se não entender a pergunta, retorne exatamente:
{
  "entidade": null,
  "acao": null,
  "filtros": {}
}
`.trim();
  }
}
