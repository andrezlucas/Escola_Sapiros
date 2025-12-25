import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { AvisosService } from './avisos.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';
import { FilterAvisoDto } from './dto/filter-aviso.dto';
import { FilterCalendarioDto } from './dto/filter-calendario.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { Aviso } from './entities/aviso.entity';

type AuthRequest = Request & { user: Usuario };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('avisos')
export class AvisosController {
  constructor(private readonly avisosService: AvisosService) {}

  @Roles(Role.COORDENACAO)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() createAvisoDto: CreateAvisoDto,
    @Req() req: AuthRequest,
  ): Promise<Aviso> {
    return this.avisosService.create(createAvisoDto, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      skipMissingProperties: true,
    }),
  )
  async findAll(
    @Query() filters: FilterAvisoDto,
    @Req() req: AuthRequest,
  ): Promise<Aviso[]> {
    return this.avisosService.findAll(filters, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get('calendario')
  @UsePipes(new ValidationPipe({ transform: true }))
  async calendario(
    @Query() filters: FilterCalendarioDto,
    @Req() req: AuthRequest,
  ): Promise<Aviso[]> {
    return this.avisosService.findForCalendar(filters, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<Aviso> {
    return this.avisosService.findOne(id, req.user);
  }

  @Roles(Role.COORDENACAO)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAvisoDto: UpdateAvisoDto,
    @Req() req: AuthRequest,
  ): Promise<Aviso> {
    return this.avisosService.update(id, updateAvisoDto, req.user);
  }

  @Roles(Role.COORDENACAO)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    await this.avisosService.remove(id, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Post(':id/confirmar')
  async confirmar(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    await this.avisosService.confirmar(id, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get('nao-confirmados')
  async naoConfirmados(@Req() req: AuthRequest): Promise<Aviso[]> {
    return this.avisosService.findNaoConfirmados(req.user);
  }

}
