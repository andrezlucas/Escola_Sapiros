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
} from '@nestjs/common';

import { TurmaService } from './turma.service';
import { Turma } from './entities/turma.entity';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';

import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { TurmaAtivaGuard } from './guards/turma-ativa.guard';

@Controller('turmas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TurmaController {
  constructor(private readonly turmaService: TurmaService) {}

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
  @Roles('coordenacao', 'professores')
  @Get('dashboard/estatisticas')
  async getDashboard() {
    return this.turmaService.getDashboard();
}
}
