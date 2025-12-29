import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';

import { AtividadeService } from './atividade.service';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';

import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Role } from '../usuario/entities/usuario.entity';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';

@Controller('atividades')
@UseGuards(JwtAuthGuard, RolesGuard) // O JwtAuthGuard PRECISA vir primeiro para preencher o req.user
export class AtividadeController {
  constructor(private readonly atividadeService: AtividadeService) {}

  @Post()
  @Roles(Role.PROFESSOR)
  create(@Body() dto: CreateAtividadeDto, @Req() req) {
    return this.atividadeService.create(dto, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.atividadeService.findOne(id);
  }

  @Get('turma/:turmaId')
  findByTurma(@Param('turmaId', ParseUUIDPipe) turmaId: string) {
    return this.atividadeService.findByTurma(turmaId);
  }

  @Put(':id')
  @Roles(Role.PROFESSOR)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAtividadeDto,
  ) {
    return this.atividadeService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PROFESSOR)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.atividadeService.remove(id);
  }
}