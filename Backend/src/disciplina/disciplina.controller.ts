import {Body, Controller, Delete, Get, Param, ParseUUIDPipe,Patch, Post, Req, UseGuards, UsePipes,ValidationPipe,} from '@nestjs/common';
import type { Request } from 'express';
import { DisciplinaService } from './disciplina.service';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { Disciplina } from './entities/disciplina.entity';
import { Habilidade } from './entities/habilidade.entity';
import { CreateHabilidadeDto } from './dto/create-habilidade.dto';
import { UpdateHabilidadeDto } from './dto/update-habilidade.dto';

type AuthRequest = Request & { user?: Usuario | any };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disciplinas')
export class DisciplinaController {
  constructor(private readonly disciplinaService: DisciplinaService) {}

  // Criar disciplina: apenas coordenação
  @Roles(Role.COORDENACAO)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() createDisciplinaDto: CreateDisciplinaDto,
    @Req() req: AuthRequest,
  ): Promise<Disciplina> {
    return await this.disciplinaService.create(createDisciplinaDto, req.user);
  }

  // Listar disciplinas: coordenação, professores e alunos
  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get()
  async findAll(@Req() req: AuthRequest): Promise<Disciplina[]> {
    return await this.disciplinaService.findAll(req.user);
  }

  // Buscar por id: coordenação, professores e alunos
  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<Disciplina> {
    return await this.disciplinaService.findOne(id, req.user);
  }

  // Atualizar disciplina: apenas coordenação
  @Roles(Role.COORDENACAO)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDisciplinaDto: UpdateDisciplinaDto,
    @Req() req: AuthRequest,
  ): Promise<Disciplina> {
    return await this.disciplinaService.update(id, updateDisciplinaDto, req.user);
  }

  // Remover disciplina: apenas coordenação
  @Roles(Role.COORDENACAO)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return await this.disciplinaService.remove(id, req.user);
  }

  // ===== HABILIDADES =====
  // Criar habilidade: apenas coordenação
  @Roles(Role.COORDENACAO)
  @Post(':id/habilidades')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createHabilidade(
    @Param('id', ParseUUIDPipe) disciplinaId: string,
    @Body() dto: CreateHabilidadeDto,
    @Req() req: AuthRequest,
  ): Promise<Habilidade> {
    return await this.disciplinaService.createHabilidade(disciplinaId, dto, req.user);
  }

  // Listar habilidades: coordenação, professor (se ministra), aluno
  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get(':id/habilidades')
  async findHabilidades(
    @Param('id', ParseUUIDPipe) disciplinaId: string,
    @Req() req: AuthRequest,
  ): Promise<Habilidade[]> {
    return await this.disciplinaService.findHabilidades(disciplinaId, req.user);
  }

  // Atualizar habilidade: apenas coordenação
  @Roles(Role.COORDENACAO)
  @Patch(':id/habilidades/:habilidadeId')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateHabilidade(
    @Param('habilidadeId', ParseUUIDPipe) habilidadeId: string,
    @Body() dto: UpdateHabilidadeDto,
    @Req() req: AuthRequest,
  ): Promise<Habilidade> {
    return await this.disciplinaService.updateHabilidade(habilidadeId, dto, req.user);
  }

  // Remover habilidade: apenas coordenação
  @Roles(Role.COORDENACAO)
  @Delete(':id/habilidades/:habilidadeId')
  async removeHabilidade(
    @Param('habilidadeId', ParseUUIDPipe) habilidadeId: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return await this.disciplinaService.removeHabilidade(habilidadeId, req.user);
  }
}
