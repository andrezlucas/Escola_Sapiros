import { Injectable } from '@nestjs/common';
import { IaQueryIntentService } from './ia-query-intent.service';
import { IaQueryMapperService } from './ia-query-mapper.service';
import { IaSimpleService } from '../ia/ia-simple.service';

@Injectable()
export class IaQueryService {
  constructor(
    private readonly intentService: IaQueryIntentService,
    private readonly mapperService: IaQueryMapperService,
    private readonly ia: IaSimpleService,
  ) {}

  async perguntar(pergunta: string, alunoId: string) {
    // 1️⃣ Interpreta a intenção
    const intent = await this.intentService.interpretar(pergunta);

    // 2️⃣ Garante estrutura de filtros
    intent.filtros ??= {};

    // 3️⃣ Extrai nome do aluno da pergunta (se houver)
    const nomeAluno = this.extrairNomeAluno(pergunta);

    if (nomeAluno) {
      // Busca por nome explícito
      intent.filtros.nomeAluno = nomeAluno;
    } else {
      // Fallback: aluno logado
      intent.filtros.alunoId = alunoId;
    }

    // 4️⃣ Executa consulta mapeada
    const dados = await this.mapperService.executar(intent);

    // 5️⃣ IA explica o resultado
    return this.ia.processarComando(
      `
Explique os dados abaixo para um aluno.
Use linguagem simples.
Não utilize termos técnicos.
Seja claro, direto e educativo.
      `.trim(),
      JSON.stringify(dados),
    );
  }

  /**
   * Extrai nome do aluno a partir da pergunta
   * Exemplos:
   * - "qual a nota do aluno João Silva"
   * - "frequência da aluna maria"
   */
  private extrairNomeAluno(texto: string): string | null {
    const regex =
      /(aluno|aluna)\s+([a-zà-ú]+(\s+[a-zà-ú]+)*)/i;

    const match = texto.match(regex);

    return match ? match[2].trim() : null;
  }
}
