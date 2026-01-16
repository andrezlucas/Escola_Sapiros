import { Injectable } from '@nestjs/common';

@Injectable()
export class IaSimpleService {
  private readonly apiKey = process.env.OPENROUTER_API_KEY;
  private readonly model = 'gpt-4o-mini';

  async processarComando(
    pergunta: string,
    promptSistema: string,
  ): Promise<string> {
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
            { role: 'system', content: promptSistema },
            { role: 'user', content: pergunta },
          ],
          temperature: 0,
        }),
      },
    );

    const data = await response.json();
    const texto = data?.choices?.[0]?.message?.content;

    if (!texto) {
      throw new Error('IA retornou resposta vazia');
    }

    return texto.trim();
  }
}
