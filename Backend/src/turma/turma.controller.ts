import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  Query,
  Req,
} from '@nestjs/common';

import { TurmaService } from './turma.service';
import { Turma } from './entities/turma.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';

import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { TurmaAtivaGuard } from './guards/turma-ativa.guard';
import { DashboardResumoDto, DashboardAlunoDto, DashboardEvolucaoDto, DashboardHabilidadeDto, HabilidadeDestaqueDto, DashboardProximaAtividadeDto } from './dto/dashboard-pedagogico.dto';
import { AtividadeService } from '../atividade/atividade.service';


@Controller('turmas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TurmaController {
  constructor(private readonly turmaService: TurmaService,
    private readonly atividadeService: AtividadeService
  ) {}

  @Roles('coordenacao', 'professor')
  @Get()
  async findAll(): Promise<Turma[]> {
    return this.turmaService.findAll();
  }

  @Roles('coordenacao', 'professor')
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Turma> {
    return this.turmaService.findOne(id);
  }

  @Roles('coordenacao')
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() dto: CreateTurmaDto): Promise<Turma> {
    return this.turmaService.create(dto);
  }

  @Roles('coordenacao')
  @Patch(':id')
  @UseGuards(TurmaAtivaGuard)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTurmaDto,
  ): Promise<Turma> {
    return this.turmaService.update(id, dto);
  }

  @Roles('coordenacao')
  @Patch(':id/ativa')
  async toggleAtiva(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('ativa') ativa: boolean,
  ): Promise<Turma> {
    return this.turmaService.toggleAtiva(id, ativa);
  }

  @Roles('coordenacao')
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.turmaService.remove(id);
  }

  @Roles('coordenacao')
  @Post(':turmaId/alunos/:alunoId')
  @UseGuards(TurmaAtivaGuard)
  async addAluno(
    @Param('turmaId', ParseUUIDPipe) turmaId: string,
    @Param('alunoId', ParseUUIDPipe) alunoId: string,
  ): Promise<Turma> {
    return this.turmaService.addAluno(turmaId, alunoId);
  }

  @Roles('coordenacao')
  @Delete(':turmaId/alunos/:alunoId')
  @UseGuards(TurmaAtivaGuard)
  async removeAluno(
    @Param('turmaId', ParseUUIDPipe) turmaId: string,
    @Param('alunoId', ParseUUIDPipe) alunoId: string,
  ): Promise<Turma> {
    return this.turmaService.removeAluno(turmaId, alunoId);
  }

  @Roles('coordenacao')
  @Post(':turmaId/professor/:professorId')
  @UseGuards(TurmaAtivaGuard)
  async definirProfessor(
    @Param('turmaId', ParseUUIDPipe) turmaId: string,
    @Param('professorId', ParseUUIDPipe) professorId: string,
  ): Promise<Turma> {
    return this.turmaService.definirProfessor(
      turmaId,
      professorId,
    );
  }

  @Roles('coordenacao')
  @Delete(':turmaId/professor')
  @UseGuards(TurmaAtivaGuard)
  async removerProfessor(
    @Param('turmaId', ParseUUIDPipe) turmaId: string,
  ): Promise<Turma> {
    return this.turmaService.removerProfessor(turmaId);
  }

  //grafico de desempenho
  @Roles('coordenacao', 'professor')
  @Get('dashboard/estatisticas')
  async getDashboard() {
    return this.turmaService.getDashboard();
}

@Roles('coordenacao', 'professor')
  @Get(':id/dashboard/resumo')
  async getDashboardResumo(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<DashboardResumoDto> {
    return this.turmaService.getDashboardResumo(id);
  }

@Roles('coordenacao', 'professor')
  @Get(':id/dashboard/evolucao')
  async getDashboardEvolucao(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('periodo') periodo: 'bimestral' | 'trimestral' | 'semestral' = 'semestral',
  ): Promise<DashboardEvolucaoDto[]> {
    return this.turmaService.getDashboardEvolucao(id, periodo);
  }

  @Roles('coordenacao', 'professor')
  @Get(':id/dashboard/alunos')
  async getDashboardAlunos(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<DashboardAlunoDto[]> {
    return this.turmaService.getDashboardAlunos(id);
  }

  @Roles('coordenacao', 'professor')
  @Get(':id/dashboard/competencias')
  async getDashboardCompetencias(
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<DashboardHabilidadeDto[]> {
    return this.turmaService.getDashboardCompetencias(id);
  }

  @Roles('professor')
  @Get('dashboard/professor/habilidades-destaque')
  async getHabilidadesDestaque(@Req() req): Promise<HabilidadeDestaqueDto[]> {
    return this.turmaService.getHabilidadesCriticasProfessor(req.user.id);
  }

  @Roles('professor')
  @Get('dashboard/professor/proximas')
  async getProximasAtividades(@Req() req): Promise<DashboardProximaAtividadeDto[]> {
    return this.atividadeService.listarProximasDoProfessor(req.user.id);
  }

  
}
