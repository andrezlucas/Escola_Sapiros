import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { IaSimpleService } from './ia-simple.service';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../usuario/entities/usuario.entity';
import { BadRequestException } from '@nestjs/common';
import { IntentIA } from './ia-query.types';
import { IaQueryMapperService } from './ia-query-mapper.service';

@Controller('ia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IaController {
  constructor(private readonly iaSimpleService: IaSimpleService
    , private readonly iaQueryMapper: IaQueryMapperService
  ) {}


  @Post('comando') // não faz consultas no BANCO
  @Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  async processarComando(
    @Body() body: { comando: string; contexto?: string },
  ) {
    const resposta = await this.iaSimpleService.processarComando(
      body.comando,
      body.contexto,
    );

    return {
      sucesso: true,
      resposta,
    };
  }

  /**
   * Endpoint para sugerir dicas de estudo
   * POST /ia/dicas-estudo
   */
  @Post('dicas-estudo')
  @Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  async sugerirDicas(
    @Body()
    body: {
      disciplina: string;
      notasRecentes: number[];
      dificuldades?: string[];
    },
  ) {
    const dicas = await this.iaSimpleService.sugerirDicasEstudo(
      body.disciplina,
      body.notasRecentes,
      body.dificuldades,
    );

    return {
      sucesso: true,
      disciplina: body.disciplina,
      dicas,
    };
  }

  /**
   * Endpoint para explicar conceitos
   * GET /ia/explicar
   */
  @Get('explicar')
  @Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  async explicarConceito(
    @Query('conceito') conceito: string,
    @Query('nivel') nivel?: string,
  ) {
    const explicacao = await this.iaSimpleService.explicarConceito(
      conceito,
      nivel || 'fundamental',
    );

    return {
      sucesso: true,
      conceito,
      explicacao,
    };
  }

  /**
   * Endpoint para gerar resumos
   * POST /ia/resumo
   */
  @Post('resumo')
  @Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  async gerarResumo(
    @Body() body: { topico: string; disciplina: string },
  ) {
    const resumo = await this.iaSimpleService.gerarResumo(
      body.topico,
      body.disciplina,
    );

    return {
      sucesso: true,
      topico: body.topico,
      disciplina: body.disciplina,
      resumo,
    };
  }

  /**
   * Endpoint para corrigir textos
   * POST /ia/corrigir-texto
   */
  @Post('corrigir-texto')
  @Roles(Role.ALUNO, Role.PROFESSOR)
  async corrigirTexto(@Body() body: { texto: string }) {
    const resultado = await this.iaSimpleService.corrigirTexto(body.texto);

    return {
      sucesso: true,
      textoOriginal: body.texto,
      ...resultado,
    };
  }


  /**
   * Endpoint principal — pergunta livre com IA --> consulta ao banco
   */
  @Roles(Role.COORDENACAO)
  @Post('perguntar')
  async perguntar(@Body('pergunta') pergunta: string) {
    if (!pergunta) {
      throw new BadRequestException('Pergunta não informada');
    }

    const intent: IntentIA = await this.interpretarPergunta(pergunta);
    const resultado = await this.iaQueryMapper.executar(intent);

    return {
      pergunta,
      intent,
      resultado,
    };
  }

  /**
   * ========= ENDPOINTS DIRETOS =========
   */
  @Roles(Role.COORDENACAO)
  @Post('habilidade/mais-forte')
  habilidadeMaisForte(@Body('alunoId') alunoId: string) {
    if (!alunoId) {
      throw new BadRequestException('alunoId é obrigatório');
    }

    return this.iaQueryMapper.executar({
      entidade: 'habilidade',
      acao: 'consultar',
      filtros: { alunoId },
    });
  }

  @Roles(Role.COORDENACAO)
  @Post('notas/media')
  mediaGeral(@Body('alunoId') alunoId: string) {
    if (!alunoId) {
      throw new BadRequestException('alunoId é obrigatório');
    }

    return this.iaQueryMapper.executar({
      entidade: 'nota',
      acao: 'media',
      filtros: { alunoId },
    });
  }
  @Roles(Role.COORDENACAO)
  @Post('notas/pior-desempenho')
  piorDesempenho(@Body('alunoId') alunoId: string) {
    if (!alunoId) {
      throw new BadRequestException('alunoId é obrigatório');
    }

    return this.iaQueryMapper.executar({
      entidade: 'nota',
      acao: 'menor_desempenho',
      filtros: { alunoId },
    });
  }
  @Roles(Role.COORDENACAO)
  @Post('frequencia/por-data')
  frequenciaPorData(
    @Body('alunoId') alunoId: string,
    @Body('data') data: string,
  ) {
    if (!alunoId || !data) {
      throw new BadRequestException('alunoId e data são obrigatórios');
    }

    return this.iaQueryMapper.executar({
      entidade: 'frequencia',
      acao: 'consultar',
      filtros: { alunoId, data },
    });
  }
  @Roles(Role.COORDENACAO)
  @Post('atividades/pendentes')
  atividadesPendentes(@Body('alunoId') alunoId: string) {
    if (!alunoId) {
      throw new BadRequestException('alunoId é obrigatório');
    }

    return this.iaQueryMapper.executar({
      entidade: 'atividade',
      acao: 'pendencias',
      filtros: { alunoId },
    });
  }
  @Roles(Role.COORDENACAO)
  @Post('simulados/quantidade')
  quantidadeSimulados(@Body('alunoId') alunoId: string) {
    if (!alunoId) {
      throw new BadRequestException('alunoId é obrigatório');
    }

    return this.iaQueryMapper.executar({
      entidade: 'simulado',
      acao: 'quantidade',
      filtros: { alunoId },
    });
  }

private async interpretarPergunta(pergunta: string): Promise<IntentIA> {
  const texto = pergunta.toLowerCase();

  // ⚠️ depois você pode pegar isso do JWT
  const alunoId = 'ID_DO_ALUNO';

  /**
   * ========= HABILIDADES =========
   */
  if (
    texto.includes('habilidade') &&
    (texto.includes('mais facilidade') ||
      texto.includes('melhor') ||
      texto.includes('domina'))
  ) {
    return {
      entidade: 'habilidade',
      acao: 'maior_facilidade',
      filtros: { alunoId },
    };
  }

  /**
   * ========= NOTAS =========
   */
  if (texto.includes('média') || texto.includes('media')) {
    return {
      entidade: 'nota',
      acao: 'media',
      filtros: { alunoId },
    };
  }

  if (
    texto.includes('pior') ||
    texto.includes('menor desempenho') ||
    texto.includes('vai mal')
  ) {
    return {
      entidade: 'nota',
      acao: 'menor_desempenho',
      filtros: { alunoId },
    };
  }

  /**
   * ========= FREQUÊNCIA =========
   */
  if (texto.includes('falt') || texto.includes('frequência')) {
    const data = this.extrairData(texto);

    if (!data) {
      throw new BadRequestException(
        'Informe a data para consulta de frequência',
      );
    }

    return {
      entidade: 'frequencia',
      acao: 'buscar_por_data',
      filtros: {
        alunoId,
        data,
      },
    };
  }

  /**
   * ========= ATIVIDADES =========
   */
  if (
    texto.includes('atividade') &&
    (texto.includes('pendente') || texto.includes('não entregue'))
  ) {
    return {
      entidade: 'atividade',
      acao: 'pendencias',
      filtros: { alunoId },
    };
  }

  /**
   * ========= SIMULADOS =========
   */
  if (texto.includes('simulado')) {
    return {
      entidade: 'simulado',
      acao: 'quantidade',
      filtros: { alunoId },
    };
  }

  throw new BadRequestException(
    'Não consegui interpretar sua pergunta. Tente reformular.',
  );
}
private extrairData(texto: string): string | null {
  // formatos: 10/03, 10-03-2026, 10/03/2026
  const regex = /(\d{2})[\/\-](\d{2})([\/\-](\d{4}))?/;
  const match = texto.match(regex);

  if (!match) return null;

  const dia = match[1];
  const mes = match[2];
  const ano = match[4] || new Date().getFullYear().toString();

  return `${ano}-${mes}-${dia}`; // formato ISO
}

}
