import { Injectable } from '@nestjs/common';
import { Habilidade } from '../disciplina/entities/habilidade.entity';

@Injectable()
export class IaQuestoesService {
  private readonly apiKey = process.env.OPENROUTER_API_KEY;
  private readonly model = 'gpt-4o-mini';

  async gerarQuestoes(params: {
    disciplina: string;
    tema: string;
    habilidades?: Habilidade[];
    quantidade: number;
    tipos?: string[];
  }) {
    const prompt = this.montarPrompt(params);

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                'Você é um professor especialista em criar questões educacionais.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.25,
          max_tokens: 1200,
        }),
      },
    );

    const data = await response.json();

    const texto = data?.choices?.[0]?.message?.content;

    if (!texto) {
      throw new Error('A IA retornou uma resposta vazia.');
    }

    return this.parseResposta(texto);
  }

  private montarPrompt(params: any) {
    const habilidadesTexto =
      Array.isArray(params.habilidades) && params.habilidades.length
        ? params.habilidades.map((h) => `- ${h.nome}`).join('\n')
        : 'Não especificadas';

    const tiposTexto =
      Array.isArray(params.tipos) && params.tipos.length
        ? params.tipos.join(', ')
        : 'MULTIPLA_ESCOLHA';

    const quantidade = params.quantidade ?? 1;
    const disciplina = params.disciplina ?? 'Não especificada';
    const tema = params.tema ?? 'Não especificado';

    return `
Você é um professor especialista na disciplina "${disciplina}".

Tarefa:
Gerar ${quantidade} questões educacionais sobre o tema "${tema}".

Tipos permitidos:
${tiposTexto}

Habilidades relacionadas:
${habilidadesTexto}

REGRAS OBRIGATÓRIAS:
- Gere SOMENTE questões corretas e verificadas.
- Antes de marcar a alternativa correta, valide mentalmente se ela está correta.
- Se houver qualquer dúvida sobre a resposta correta, descarte a questão e gere outra.
- Nunca marque uma alternativa incorreta como correta.
- Retorne SOMENTE JSON válido.
- Não escreva texto fora do JSON.
- Não use markdown.
- Use EXATAMENTE a estrutura abaixo.

REGRAS POR TIPO:
- MULTIPLA_ESCOLHA: exatamente 4 alternativas, apenas 1 correta.
- VERDADEIRO_FALSO: exatamente 2 alternativas: "Verdadeiro" e "Falso".
- DISSERTATIVA: não inclua alternativas.

FORMATO DE SAÍDA OBRIGATÓRIO:

{
  "questoes": [
    {
      "enunciado": "Texto claro e objetivo",
      "tipo": "MULTIPLA_ESCOLHA | VERDADEIRO_FALSO | DISSERTATIVA",
      "valor": 1,
      "alternativas": [
        { "texto": "Alternativa A", "correta": false },
        { "texto": "Alternativa B", "correta": true },
        { "texto": "Alternativa C", "correta": false },
        { "texto": "Alternativa D", "correta": false }
      ],
      "explicacaoRespostaCorreta": "Explique brevemente por que essa alternativa é correta."
    }
  ]
}
`;
  }

  private parseResposta(texto: string) {
    try {
      const match = texto.match(/\{[\s\S]*\}/);
      if (!match) throw new Error();
      return JSON.parse(match[0]);
    } catch {
      throw new Error('A IA retornou JSON inválido. Tente novamente.');
    }
  }
}
