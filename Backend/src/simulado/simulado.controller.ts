import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Patch,
} from '@nestjs/common';
import { SimuladoService } from './simulado.service';
import { CreateSimuladoDto } from './dto/create-simulado.dto';
import { GerarQuestoesIaDto } from '../atividade/dto/gerar-questoes-ia.dto';
import { UpdateSimuladoDto } from './dto/update-simulado.dto';
import { CreateQuestaoDto } from '../atividade/dto/create-questao.dto';
import { UpdateQuestaoDto } from '../atividade/dto/update-questao.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../usuario/entities/usuario.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';

@Controller('simulados')
export class SimuladoController {
  constructor(private readonly simuladoService: SimuladoService) {}

  @Post()
  @Roles(Role.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() dto: CreateSimuladoDto, @Req() req) {
    return this.simuladoService.create(dto, req.user.id);
  }

  @Get('professor')
  @Roles(Role.PROFESSOR, Role.ALUNO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAll(@Req() req) {
    return this.simuladoService.findAllByProfessor(req.user.id);
  }

  @Get(':id')
  @Roles(Role.PROFESSOR, Role.ALUNO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.simuladoService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove(@Param('id') id: string, @Req() req) {
    return this.simuladoService.remove(id, req.user.id);
  }

  @Post('gerar-ia')
  @Roles(Role.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  gerarIa(@Body() dto: GerarQuestoesIaDto, @Req() req) {
    return this.simuladoService.gerarQuestoesIa(dto, req.user.id);
  }
  @Patch(':id')
  @Roles(Role.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() dto: UpdateSimuladoDto, @Req() req) {
    return this.simuladoService.update(id, dto, req.user.id);
  }

  @Post(':id/questoes')
  @Roles(Role.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  adicionarQuestao(
    @Param('id') id: string,
    @Body() dto: CreateQuestaoDto,
    @Req() req,
  ) {
    return this.simuladoService.adicionarQuestao(id, dto, req.user.id);
  }

  @Patch(':id/questoes/:questaoId')
  @Roles(Role.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  patchQuestao(
    @Param('id') id: string,
    @Param('questaoId') questaoId: string,
    @Body() dto: UpdateQuestaoDto,
    @Req() req,
  ) {
    return this.simuladoService.patchQuestao(id, questaoId, dto, req.user.id);
  }

  @Delete(':id/questoes/:questaoId')
  @Roles(Role.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  removerQuestao(
    @Param('id') id: string,
    @Param('questaoId') questaoId: string,
    @Req() req,
  ) {
    return this.simuladoService.removerQuestao(id, questaoId, req.user.id);
  }

  @Get('aluno/disponiveis')
  @Roles(Role.ALUNO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findDisponiveisParaAluno(@Req() req) {
    return this.simuladoService.findDisponiveisParaAluno(req.user.id);
  }

  @Get('turma/:turmaId')
  @Roles(Role.PROFESSOR, Role.ALUNO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findByTurma(@Param('turmaId') turmaId: string) {
    return this.simuladoService.findByTurma(turmaId);
  }

  @Post(':id/iniciar')
  @Roles(Role.ALUNO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  iniciar(@Param('id') id: string, @Req() req) {
    return this.simuladoService.iniciarSimulado(id, req.user.id);
  }

  @Post(':id/finalizar')
  @Roles(Role.ALUNO)
  @UseGuards(JwtAuthGuard, RolesGuard)
  finalizar(
    @Param('id') id: string,
    @Body() respostasDto: any, // Crie um DTO similar ao CriarEntregaDto de atividade
    @Req() req,
  ) {
    return this.simuladoService.finalizarSimulado(
      id,
      respostasDto,
      req.user.id,
    );
  }

  @Get('tentativa/:id')
  @Roles(Role.ALUNO, Role.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  buscarTentativa(@Param('id') id: string) {
    return this.simuladoService.buscarTentativa(id);
  }

  @Patch(':id/arquivar')
  @Roles(Role.PROFESSOR)
  @UseGuards(JwtAuthGuard, RolesGuard)
  arquivar(@Param('id') id: string, @Req() req) {
    return this.simuladoService.arquivar(id, req.user.id);
  }
}
