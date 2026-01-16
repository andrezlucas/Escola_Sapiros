import { BadRequestException, Injectable } from '@nestjs/common';
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

  async perguntar(pergunta: string) {
    const intent = await this.intentService.interpretar(pergunta);

    intent.filtros ??= {};

    const nomeAluno = this.extrairNomeAluno(pergunta);

    if (!nomeAluno) {
      throw new BadRequestException(
        'Nome do aluno não identificado na pergunta',
      );
    }

    intent.filtros.nomeAluno = nomeAluno;

    return this.mapperService.executar(intent);
  }

  /**
   * Extrai nome do aluno a partir da pergunta
   * Exemplos:
   * - "qual a nota do aluno João Silva"
   * - "frequência da aluna maria"
   */
  private extrairNomeAluno(texto: string): string | null {
    const regex =
      /(aluno|aluna)\s+([a-zà-ú]+(?:\s+[a-zà-ú]+)*)(?=\s+(tem|está|vai|precisa|com|em|no|na|de)|\?|$)/i;

    const match = texto.match(regex);
    return match ? match[2].trim() : null;
  }
}
