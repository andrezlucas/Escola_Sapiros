import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { NotaService } from './nota.service';
import { Usuario } from '../usuario/entities/usuario.entity';
import { CreateNotaDto } from './dto/create-nota.dto';
import { UpdateNotaDto } from './dto/update-nota.dto';
import { FilterNotaDto } from './dto/filter-nota.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../usuario/entities/usuario.entity';
import { Nota } from './entities/nota.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notas')
export class NotaController {
  constructor(private readonly notaService: NotaService) {}

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(@Body() createNotaDto: CreateNotaDto, @Req() req: Request & { user: Usuario }): Promise<Nota> {
    return await this.notaService.create(createNotaDto, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Post('bulk')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createBulk(@Body() createNotasDto: CreateNotaDto[], @Req() req: Request & { user: Usuario }): Promise<Nota[]> {
    return await this.notaService.saveBulk(createNotasDto, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async findAll(@Query() filters: FilterNotaDto, @Req() req: Request & { user: Usuario }): Promise<Nota[]> {
    return await this.notaService.findAll(filters, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: Usuario }): Promise<Nota> {
    return await this.notaService.findOne(id, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateNotaDto: UpdateNotaDto,
    @Req() req: Request & { user: Usuario },
  ): Promise<Nota> {
    return await this.notaService.update(id, updateNotaDto, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request & { user: Usuario }): Promise<void> {
    return await this.notaService.remove(id, req.user);
  }
}