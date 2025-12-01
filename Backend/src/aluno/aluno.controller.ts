import { Controller,Get, Post, Body,Patch, Param, Delete,UseGuards, ValidationPipe, UsePipes, Req,} from '@nestjs/common';
import type { Request } from 'express';
import { AlunoService } from './aluno.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { MatriculaParamDto } from './dto/matricula-param.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';

type AuthRequest = Request & { user?: Usuario | { id: string; role: Role; matricula_aluno?: string } | any };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alunos')
export class AlunoController {
  constructor(private readonly alunoService: AlunoService) {}

  // Criar aluno: apenas coordenação
  @Roles(Role.COORDENACAO)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() createAlunoDto: CreateAlunoDto, @Req() req: AuthRequest) {
    return await this.alunoService.create(createAlunoDto, req.user);
  }

  // Listar alunos: coordenação e professores
  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Get()
  async findAll(@Req() req: AuthRequest) {
    return await this.alunoService.findAll(req.user);
  }

  // Buscar por matrícula: coordenação e professores (validação via MatriculaParamDto)
  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Get(':matricula')
  async findOne(
    @Param(new ValidationPipe({ transform: true })) params: MatriculaParamDto,
    @Req() req: AuthRequest,
  ) {
    return await this.alunoService.findOne(params.matricula, req.user);
  }

  // Atualizar aluno: apenas coordenação
  @Roles(Role.COORDENACAO)
  @Patch(':matricula')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param(new ValidationPipe({ transform: true })) params: MatriculaParamDto,
    @Body() updateAlunoDto: UpdateAlunoDto,
    @Req() req: AuthRequest,
  ) {
    return await this.alunoService.update(params.matricula, updateAlunoDto, req.user);
  }

  // Remover aluno: apenas coordenação
  @Roles(Role.COORDENACAO)
  @Delete(':matricula')
  async remove(
    @Param(new ValidationPipe({ transform: true })) params: MatriculaParamDto,
    @Req() req: AuthRequest,
  ) {
    return await this.alunoService.remove(params.matricula, req.user);
  }
}
