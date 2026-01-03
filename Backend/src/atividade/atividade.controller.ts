import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  ParseUUIDPipe,
  Req,
  Patch,
  ForbiddenException,
} from '@nestjs/common';

import { AtividadeService } from './atividade.service';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';
import { CriarEntregaDto } from './dto/criar-entrega.dto';
import { UpdateQuestaoDto } from './dto/update-questao.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from '../usuario/entities/usuario.entity';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { GerarQuestoesIaDto } from './dto/gerar-questoes-ia.dto';


@Controller('atividades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AtividadeController {
  constructor(private readonly atividadeService: AtividadeService) {}

  @Post()
  @Roles(Role.PROFESSOR)
  create(@Body() dto: CreateAtividadeDto, @Req() req) {
    return this.atividadeService.create(dto, req.user.id);
  }

  @Get('professor/minhas-atividades')
  @Roles(Role.PROFESSOR)
  listarMinhasAtividades(@Req() req) {
    return this.atividadeService.findAllByProfessor(req.user.id);
  }

  @Get('meu-status')
  @Roles(Role.ALUNO)
  buscarStatusAtividades(@Req() req) {
    return this.atividadeService.listarStatusPorAluno(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.atividadeService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.PROFESSOR)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAtividadeDto,
  ) {
    return this.atividadeService.update(id, dto);
  }

  @Patch(':id')
  @Roles(Role.PROFESSOR)
  partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAtividadeDto,
  ) {
    return this.atividadeService.partialUpdate(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PROFESSOR)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.atividadeService.remove(id);
  }

  @Get('turma/:turmaId')
  @Roles(Role.ALUNO, Role.PROFESSOR)
  async findByTurma(
    @Param('turmaId', ParseUUIDPipe) turmaId: string,
    @Req() req,
  ) {
    if (req.user.role === Role.ALUNO) {
      const aluno = await this.atividadeService.buscarTurmaDoAluno(req.user.id);
      if (aluno.turma?.id !== turmaId) {
        throw new ForbiddenException(
          'Você só pode visualizar atividades da sua própria turma',
        );
      }
    }
    return this.atividadeService.findByTurma(turmaId);
  }

  @Post('responder')
  @Roles(Role.ALUNO)
  responder(@Body() dto: CriarEntregaDto, @Req() req) {
    return this.atividadeService.responderAtividade(dto, req.user.id);
  }

  @Get(':id/entregas') //por atividade
  @Roles(Role.PROFESSOR)
  listarEntregas(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    return this.atividadeService.listarEntregasPorAtividade(id, req.user.id);
  }

  @Put('entrega/:entregaId/resposta/:respostaId/corrigir')
  @Roles(Role.PROFESSOR)
  corrigirQuestao(
    @Param('entregaId', ParseUUIDPipe) entregaId: string,
    @Param('respostaId', ParseUUIDPipe) respostaId: string,
    @Body('nota') nota: number,
    @Req() req,
  ) {
    return this.atividadeService.corrigirQuestaoDissertativa(
      entregaId,
      respostaId,
      nota,
      req.user.id,
    );
  }
  @Get('professor/todas-entregas')
  @Roles(Role.PROFESSOR)
  listarTodasEntregas(@Req() req) {
    return this.atividadeService.listarTodasEntregasDoProfessor(req.user.id);
  }

  @Post('gerar-questoes-ia')
  @Roles(Role.PROFESSOR)
  gerarQuestoesIa(@Body() dto: GerarQuestoesIaDto, @Req() req) {
    return this.atividadeService.gerarQuestoesComIa(dto, req.user.id);
  }

@Delete(':atividadeId/questoes/:questaoId')
@Roles(Role.PROFESSOR)
removerQuestao(
  @Param('atividadeId', ParseUUIDPipe) atividadeId: string,
  @Param('questaoId', ParseUUIDPipe) questaoId: string,
  @Req() req,
) {
  return this.atividadeService.removerQuestao(
    atividadeId,
    questaoId,
    req.user.id,
  );
}

@Patch(':atividadeId/questoes/:questaoId')
@Roles(Role.PROFESSOR)
patchQuestao(
  @Param('atividadeId') atividadeId: string,
  @Param('questaoId') questaoId: string,
  @Body() dto: UpdateQuestaoDto,
  @Req() req,
) {
  return this.atividadeService.patchQuestao(
    atividadeId,
    questaoId,
    dto,
    req.user.id,
  );
}


}
