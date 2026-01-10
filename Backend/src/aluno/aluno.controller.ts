import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Req,
  Query,
} from '@nestjs/common';
import type { Request } from 'express';
import { AlunoService } from './aluno.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { TransferirTurmaDto } from './dto/transferir-turma.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { SenhaExpiradaGuard } from 'src/auth/senha-expirada/senha-expirada.guard';

type AuthRequest = Request & {
  user?: Usuario | { id: string; role: Role } | any;
};

@UseGuards(JwtAuthGuard, RolesGuard, SenhaExpiradaGuard)
@Controller('alunos')
export class AlunoController {
  constructor(private readonly alunoService: AlunoService) {}

  // Criar aluno: coordenação apenas
  @Roles(Role.COORDENACAO)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() createAlunoDto: CreateAlunoDto,
  ) {
    return await this.alunoService.create(createAlunoDto);
  }

  // Listar alunos: coordenação e professores
  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Get()
  async findAll() {
    return await this.alunoService.findAll();
  }

  // Buscar aluno pela PK (id herdado de Usuario)
  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ) {
    return await this.alunoService.findOne(id);
  }

  // Atualizar aluno
  @Roles(Role.COORDENACAO)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id') id: string,
    @Body() updateAlunoDto: UpdateAlunoDto,
    @Req() req: AuthRequest,
  ) {
    return await this.alunoService.update(id, updateAlunoDto);
  }

  // Remover aluno
  @Roles(Role.COORDENACAO)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: AuthRequest,
  ) {
    return await this.alunoService.remove(id);
  }

  @Post(':id/transferir-turma')
transferirTurma(
  @Param('id') id: string,
  @Body() dto: TransferirTurmaDto,
) {
  return this.alunoService.transferirTurma(id, dto);
}
@Roles(Role.ALUNO)
@Get('dashboard/perfil')
getPerfilAluno(@Req() req: AuthRequest) {
  return this.alunoService.getPerfilAluno(req.user.id);
}

@Roles(Role.ALUNO)
@Get('dashboard/resumo')
getResumo(@Req() req: AuthRequest, @Query('bimestre') bimestre?: number) {
  return this.alunoService.getResumoGeral(req.user.id, bimestre ? Number(bimestre) : undefined);
}

@Roles(Role.ALUNO)
@Get('dashboard/habilidades')
getHabilidades(@Req() req: AuthRequest, @Query('bimestre') bimestre?: number) {
  return this.alunoService.getDesempenhoPorHabilidade(req.user.id, bimestre ? Number(bimestre) : undefined);
}

@Roles(Role.ALUNO)
@Get('dashboard/habilidades-desenvolver')
getHabilidadesDesenvolver(@Req() req: AuthRequest, @Query('bimestre') bimestre?: number) {
  return this.alunoService.getHabilidadesADesenvolver(req.user.id, bimestre ? Number(bimestre) : undefined);
}

@Roles(Role.ALUNO)
@Get('dashboard/notas')
getNotas(@Req() req: AuthRequest, @Query('bimestre') bimestre?: number) {
  return this.alunoService.getNotasDetalhadas(req.user.id, bimestre ? Number(bimestre) : undefined);
}

@Roles(Role.ALUNO)
@Get('dashboard/disciplinas')
getDesempenhoDisciplinas(@Req() req: AuthRequest, @Query('bimestre') bimestre?: number) {
  return this.alunoService.getDesempenhoPorDisciplina(req.user.id, bimestre ? Number(bimestre) : undefined);
}

@Roles(Role.ALUNO)
@Get('dashboard/simulados/resumo')
getResumoSimulados(@Req() req: AuthRequest) {
  return this.alunoService.getResumoSimulados(req.user.id);
}

@Roles(Role.ALUNO)
@Get('dashboard/simulados/historico')
getHistoricoSimulados(@Req() req: AuthRequest) {
  return this.alunoService.getHistoricoSimulados(req.user.id);
}
@Roles(Role.ALUNO)
@Get('dashboard/simulados/desempenho')
getDesempenhoSimulados(@Req() req: AuthRequest) {
  return this.alunoService.getDesempenhoSimulados(req.user.id);
}


}
