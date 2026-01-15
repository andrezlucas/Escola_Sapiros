import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../usuario/entities/usuario.entity';
import { EmissaoDocumentosService } from './emissao-documentos.service';
import { SolicitacaoDocumentoService } from './solicitacao-documentos.service';
import {
  TipoDocumentoEnum,
  FormaEntregaEnum,
  StatusSolicitacaoEnum,
} from './entities/emissao-documentos.entity';
import type { Request, Response } from 'express';

@Controller('documentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentosController {
  constructor(
    private readonly emissaoService: EmissaoDocumentosService,
    private readonly solicitacaoService: SolicitacaoDocumentoService,
  ) {}

  private enviarPdf(res: Response, buffer: Buffer, filename: string) {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename=${filename}.pdf`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Post('solicitacoes')
  @Roles(Role.ALUNO)
  async criarSolicitacao(
    @Req() req: Request,
    @Body('tipoDocumento') tipoDocumento: TipoDocumentoEnum,
    @Body('formaEntrega') formaEntrega: FormaEntregaEnum,
    @Body('motivo') motivo?: string,
  ) {
    const usuario = (req as any).user;
    return this.solicitacaoService.criarSolicitacao(
      usuario,
      tipoDocumento,
      formaEntrega,
      motivo,
    );
  }

  @Get('solicitacoes/minhas')
  @Roles(Role.ALUNO)
  async listarMinhas(@Req() req: Request) {
    const usuario = (req as any).user;
    return this.solicitacaoService.listarMinhasSolicitacoes(usuario);
  }

  @Get('solicitacoes')
  @Roles(Role.COORDENACAO)
  async listarTodas(
    @Query('status') status?: StatusSolicitacaoEnum,
    @Query('search') search?: string,
  ) {
    return this.solicitacaoService.listarTodas(status, search);
  }

  @Get('solicitacoes/dashboard')
  @Roles(Role.COORDENACAO)
  async dashboard() {
    return this.solicitacaoService.dashboardSecretaria();
  }

  @Patch('solicitacoes/:id/status')
  @Roles(Role.COORDENACAO)
  async atualizarStatus(
    @Param('id') id: string,
    @Body('status') status: StatusSolicitacaoEnum,
    @Req() req: Request,
  ) {
    const usuario = (req as any).user;
    return this.solicitacaoService.atualizarStatus(id, status, usuario);
  }

  @Get('solicitacoes/:id/pdf')
  @Roles(Role.COORDENACAO, Role.ALUNO)
  async obterPdfSolicitacao(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const usuario = (req as any).user;
    const buffer = await this.solicitacaoService.obterPdf(id, usuario);
    this.enviarPdf(res, buffer, `documento-${id}`);
  }

  @Get('emissao/boletim/:alunoId')
  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  async boletim(
    @Param('alunoId') alunoId: string,
    @Query('ano') ano: string,
    @Res() res: Response,
  ) {
    const anoLetivo = ano ? parseInt(ano, 10) : new Date().getFullYear();
    const buffer = await this.emissaoService.gerarBoletimPDF(alunoId, anoLetivo);
    this.enviarPdf(res, buffer, `boletim-${alunoId}`);
  }

  @Get('emissao/historico/:alunoId')
  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  async historico(@Param('alunoId') alunoId: string, @Res() res: Response) {
    const buffer = await this.emissaoService.gerarHistoricoEscolar(alunoId);
    this.enviarPdf(res, buffer, `historico-${alunoId}`);
  }

  @Get('emissao/declaracao-matricula/:alunoId')
  @Roles(Role.COORDENACAO, Role.ALUNO)
  async declaracaoMatricula(
    @Param('alunoId') alunoId: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.emissaoService.gerarDeclaracaoMatricula(alunoId);
    this.enviarPdf(res, buffer, `declaracao-matricula-${alunoId}`);
  }

  @Get('emissao/declaracao-frequencia/:alunoId')
  @Roles(Role.COORDENACAO, Role.ALUNO)
  async declaracaoFrequencia(
    @Param('alunoId') alunoId: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.emissaoService.gerarDeclaracaoFrequencia(alunoId);
    this.enviarPdf(res, buffer, `declaracao-frequencia-${alunoId}`);
  }

  @Get('emissao/declaracao-conclusao/:alunoId')
  @Roles(Role.COORDENACAO, Role.ALUNO)
  async declaracaoConclusao(
    @Param('alunoId') alunoId: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.emissaoService.gerarDeclaracaoConclusao(alunoId);
    this.enviarPdf(res, buffer, `declaracao-conclusao-${alunoId}`);
  }

  @Get('emissao/atestado-vaga')
  @Roles(Role.COORDENACAO)
  async atestadoVaga(
    @Query('nome') nome: string,
    @Query('serie') serie: string,
    @Res() res: Response,
  ) {
    const buffer = await this.emissaoService.gerarAtestadoVaga(nome, serie);
    this.enviarPdf(res, buffer, 'atestado-vaga');
  }

  @Get('emissao/declaracao-servidor/:id')
  @Roles(Role.COORDENACAO)
  async declaracaoServidor(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const buffer =
      await this.emissaoService.gerarDeclaracaoVinculoServidor(id);
    this.enviarPdf(res, buffer, `declaracao-servidor-${id}`);
  }
}
