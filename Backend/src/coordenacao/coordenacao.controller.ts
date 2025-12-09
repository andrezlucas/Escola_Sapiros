import { Body, Controller, Delete, Get,Param, ParseUUIDPipe, Patch, Post, Req,UseGuards,UsePipes, ValidationPipe,} from '@nestjs/common';
import type { Request } from 'express';
import { CoordenacaoService } from './coordenacao.service';
import { CreateCoordenacaoDto } from './dto/create-coordenacao.dto';
import { UpdateCoordenacaoDto } from './dto/update-coordenacao.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { Coordenacao } from './entities/coordenacao.entity';

type AuthRequest = Request & { user?: Usuario | any };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('coordenacao')
export class CoordenacaoController {
  constructor(private readonly coordenacaoService: CoordenacaoService) {}

  @Roles(Role.COORDENACAO)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() createCoordenacaoDto: CreateCoordenacaoDto,
  ): Promise<Coordenacao> {
    return await this.coordenacaoService.create(createCoordenacaoDto);
  }

  @Roles(Role.COORDENACAO)
  @Get()
  async findAll(): Promise<Coordenacao[]> {
    return await this.coordenacaoService.findAll();
  }

  @Roles(Role.COORDENACAO)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Coordenacao> {
    return await this.coordenacaoService.findOne(id);
  }

  @Roles(Role.COORDENACAO)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCoordenacaoDto: UpdateCoordenacaoDto,
  ): Promise<Coordenacao> {
    return await this.coordenacaoService.update(id, updateCoordenacaoDto);
  }

  @Roles(Role.COORDENACAO)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return await this.coordenacaoService.remove(id);
  }
}