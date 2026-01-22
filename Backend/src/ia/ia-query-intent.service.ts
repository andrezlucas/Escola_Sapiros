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
- ia

Ações possíveis:
- media_geral
- pior_disciplina
- melhor_disciplina
- ranking
- buscar_por_data
- pendencias
- quantidade
- consultar
- score
- disciplinas_criticas
- sugestao_reforco
- evolucao

Formato obrigatório:
{
  "entidade": "nota | frequencia | atividade | simulado | habilidade | ia",
  "acao": "media_geral | pior_disciplina | melhor_disciplina | ranking | buscar_por_data | pendencias | quantidade | consultar | score | disciplinas_criticas | sugestao_reforco | evolucao",
  "filtros": {
    "nomeAluno"?: string,
    "data"?: string,
    "inicio"?: string,
    "fim"?: string
  }
}

Regras de interpretação:

- "média", "nota geral" → nota → media_geral
- "pior", "abaixo", "menor nota" → nota → pior_disciplina
- "melhor", "mais forte", "se destaca" → nota → melhor_disciplina
- "ranking", "classificação", "ordem das disciplinas" → nota → ranking

- "frequência", "presença", "faltou" → frequencia → buscar_por_data

- "atividades pendentes", "não entregues" → atividade → pendencias

- "quantos simulados" → simulado → quantidade

- "habilidade principal", "ponto forte" → habilidade → consultar

- "score cognitivo", "desempenho geral", "nível cognitivo" → ia → score

- "disciplinas críticas", "disciplinas fracas", "dificuldade" → ia → disciplinas_criticas

- "como melhorar", "o que estudar", "sugestão de estudo" → ia → sugestao_reforco

- "evolução", "progresso", "desempenho ao longo do tempo" → ia → evolucao

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