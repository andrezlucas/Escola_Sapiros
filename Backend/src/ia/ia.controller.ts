import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { IaSimpleService } from './ia-simple.service';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../usuario/entities/usuario.entity';

@Controller('ia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IaController {
  constructor(private readonly iaSimpleService: IaSimpleService) {}

  /**
   * RF024 - IA Mínima para Comandos Simples
   * POST /ia/comando
   */
  @Post('comando')
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
}
