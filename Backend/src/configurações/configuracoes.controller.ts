import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  ValidationPipe,
  UsePipes,
  Req,
  Query,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';

import { ConfiguracoesService } from './configuracoes.service';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { AceiteTermoDto } from './dto/aceite-termo.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';

import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { SenhaExpiradaGuard } from '../auth/senha-expirada/senha-expirada.guard';


type AuthRequest = Request & {
  user?: Usuario | { id: string; role: Role } | any;
};

@UseGuards(JwtAuthGuard, RolesGuard, SenhaExpiradaGuard)
@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(
    private readonly configuracoesService: ConfiguracoesService,
  ) {}

  @Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  @Get('perfil')
  async getPerfil(@Req() req: AuthRequest) {
    return this.configuracoesService.getPerfil(req.user.id);
  }

  @Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  @Patch('perfil')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updatePerfil(
    @Req() req: AuthRequest,
    @Body() dto: UpdatePerfilDto,
  ) {
    return this.configuracoesService.updatePerfil(req.user.id, dto);
  }


  @Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  @Patch('termos-de-uso')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async aceitarTermos(
    @Req() req: AuthRequest,
    @Body() dto: AceiteTermoDto,
  ) {
    return this.configuracoesService.aceitarTermos(
      req.user.id,
      dto.aceito,
    );
  }

@Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  @Get('termos-de-uso')
  async getStatusTermos(@Req() req: AuthRequest) {
    return this.configuracoesService.getStatusTermos(req.user.id);
  }


  @Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  @Get('codigos-acesso')
  async listarCodigosAcesso(@Req() req: AuthRequest) {
    return this.configuracoesService.listarCodigosAcesso(req.user.id);
  }

  @Roles(Role.ALUNO, Role.PROFESSOR, Role.COORDENACAO)
  @Post('codigos-acesso')
  async gerarCodigoAcesso(@Req() req: AuthRequest) {
    return this.configuracoesService.gerarCodigoAcesso(req.user.id);
  }

@Roles(Role.COORDENACAO)
@Get('gestao-usuarios')
async listarUsuarios(
  @Query('page') page: number = 1,
  @Query('search') search?: string,
  @Query('role') role?: Role,
  @Query('status') status?: string, // 'ativo' | 'inativo'
) {
  let statusFiltro: 'ativo' | 'inativo' | undefined;

  if (status === 'ativo') statusFiltro = 'ativo';
  else if (status === 'inativo') statusFiltro = 'inativo';
  else statusFiltro = undefined;

  return this.configuracoesService.listarUsuarios(page, 10, search, role, statusFiltro);
}


@Roles(Role.COORDENACAO)
@Patch('gestao-usuarios/:id/status')
async toggleStatus(@Param('id') id: string) {
  return this.configuracoesService.alternarStatusUsuario(id);
}
}
