import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import type { Request } from 'express';
import { DisciplinaService } from './disciplina.service';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto';
import { CreateHabilidadeDto } from './dto/create-habilidade.dto';
import { UpdateHabilidadeDto } from './dto/update-habilidade.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { Disciplina } from './entities/disciplina.entity';
import { Habilidade } from './entities/habilidade.entity';

type AuthRequest = Request & { user?: Usuario | any };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('disciplinas')
export class DisciplinaController {
  constructor(private readonly disciplinaService: DisciplinaService) {}

  // --- Disciplina ---
  @Roles(Role.COORDENACAO)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() createDisciplinaDto: CreateDisciplinaDto,
    @Req() req: AuthRequest,
  ): Promise<Disciplina> {
    return this.disciplinaService.create(createDisciplinaDto, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get()
  async findAll(@Req() req: AuthRequest): Promise<Disciplina[]> {
    return this.disciplinaService.findAll(req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<Disciplina> {
    return this.disciplinaService.findOne(id, req.user);
  }

  @Roles(Role.COORDENACAO)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDisciplinaDto: UpdateDisciplinaDto,
    @Req() req: AuthRequest,
  ): Promise<Disciplina> {
    return this.disciplinaService.update(id, updateDisciplinaDto, req.user);
  }

  @Roles(Role.COORDENACAO)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.disciplinaService.remove(id, req.user);
  }

  // --- Habilidade ---
  @Roles(Role.COORDENACAO)
  @Post(':id/habilidades')
  async addHabilidade(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateHabilidadeDto,
    @Req() req: AuthRequest,
  ): Promise<Habilidade> {
    return this.disciplinaService.addHabilidade(id, dto, req.user);
  }

  @Roles(Role.COORDENACAO)
  @Patch('habilidades/:id')
  async updateHabilidade(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHabilidadeDto,
    @Req() req: AuthRequest,
  ): Promise<Habilidade> {
    return this.disciplinaService.updateHabilidade(id, dto, req.user);
  }

  @Roles(Role.COORDENACAO)
  @Delete('habilidades/:id')
  async removeHabilidade(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return this.disciplinaService.removeHabilidade(id, req.user);
  }
  @Get(':disciplinaId/habilidades')
  @Roles(Role.PROFESSOR)
  findHabilidades(
    @Param('disciplinaId', ParseUUIDPipe) disciplinaId: string,
  ) {
    return this.disciplinaService.findHabilidades(disciplinaId);
  }
}
