import { Injectable } from '@nestjs/common';

@Injectable()
export class IaSimpleService {
  private readonly apiKey = process.env.OPENROUTER_API_KEY;
  private readonly model = 'gpt-4o-mini';

  /**
   * RF024 - IA Mínima para Comandos Simples
   * Processa comandos educacionais simples usando IA
   */
  async processarComando(comando: string, contexto?: string): Promise<string> {
    const prompt = this.montarPromptSimples(comando, contexto);

    try {
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
                content: this.getSystemPrompt(),
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.5,
            max_tokens: 500,
          }),
        },
      );

      const data = await response.json();

      const texto = data?.choices?.[0]?.message?.content;

      if (!texto) {
        throw new Error('A IA retornou uma resposta vazia.');
      }

      return texto.trim();
    } catch (error) {
      console.error('Erro ao processar comando com IA:', error);
      throw new Error('Não foi possível processar o comando no momento.');
    }
  }

  /**
   * Sugere dicas de estudo personalizadas com base nas notas do aluno
   */
  async sugerirDicasEstudo(
    disciplina: string,
    notasRecentes: number[],
    dificuldades?: string[],
  ): Promise<string> {
    const media = notasRecentes.reduce((a, b) => a + b, 0) / notasRecentes.length;
    
    const prompt = `
Disciplina: ${disciplina}
Média das notas recentes: ${media.toFixed(2)}
${dificuldades && dificuldades.length > 0 ? `Dificuldades relatadas: ${dificuldades.join(', ')}` : ''}

Com base nessas informações, forneça 3 dicas práticas de estudo personalizadas para melhorar o desempenho nesta disciplina. Seja breve e objetivo.
    `.trim();

    return this.processarComando(prompt);
  }

  /**
   * Explica conceitos de forma simplificada
   */
  async explicarConceito(conceito: string, nivel: string = 'fundamental'): Promise<string> {
    const prompt = `
Explique de forma simples e objetiva o conceito: "${conceito}"
Nível educacional: ${nivel}

Seja claro e use exemplos práticos. Limite a resposta a 3 parágrafos curtos.
    `.trim();

    return this.processarComando(prompt);
  }

  /**
   * Gera resumo de tópico educacional
   */
  async gerarResumo(topico: string, disciplina: string): Promise<string> {
    const prompt = `
Crie um resumo objetivo sobre o tópico "${topico}" da disciplina ${disciplina}.
O resumo deve ter:
- Conceito principal
- Pontos-chave (3-5 itens)
- Exemplo prático

Seja direto e educacional.
    `.trim();

    return this.processarComando(prompt);
  }

  /**
   * Corrige texto e sugere melhorias
   */
  async corrigirTexto(texto: string): Promise<{ textoCorrigido: string; sugestoes: string[] }> {
    const prompt = `
Corrija o seguinte texto e forneça sugestões de melhoria:

"${texto}"

Retorne no formato:
TEXTO CORRIGIDO:
[texto corrigido aqui]

SUGESTÕES:
- [sugestão 1]
- [sugestão 2]
- [sugestão 3]
    `.trim();

    const resposta = await this.processarComando(prompt);
    
    // Parse da resposta
    const partes = resposta.split('SUGESTÕES:');
    const textoCorrigido = partes[0]
      .replace('TEXTO CORRIGIDO:', '')
      .trim();
    
    const sugestoesTexto = partes[1] || '';
    const sugestoes = sugestoesTexto
      .split('\n')
      .filter(linha => linha.trim().startsWith('-'))
      .map(linha => linha.replace(/^-\s*/, '').trim());

    return {
      textoCorrigido,
      sugestoes: sugestoes.length > 0 ? sugestoes : ['Texto está adequado.'],
    };
  }

  private montarPromptSimples(comando: string, contexto?: string): string {
    let prompt = comando;

    if (contexto) {
      prompt = `Contexto: ${contexto}\n\nComando: ${comando}`;
    }

    return prompt;
  }

  private getSystemPrompt(): string {
    return `Você é um assistente educacional inteligente da Escola Sapiros.
Suas responsabilidades:
- Auxiliar alunos e professores com dúvidas educacionais
- Fornecer explicações claras e objetivas
- Sugerir métodos de estudo eficazes
- Ser conciso e direto nas respostas
- Manter um tom profissional e educacional
- Limitar respostas a no máximo 5 parágrafos curtos

Não responda perguntas não relacionadas ao contexto educacional.`;
  }

  
}
