import { Controller, Get, Post, Body, Query, Req, UseGuards, UsePipes, ValidationPipe, ParseUUIDPipe, Patch, Delete, Param } from '@nestjs/common';
import { FrequenciaService } from './frequencia.service';
import { CreateFrequenciaDto } from './dto/create-frequencia.dto';
import { FrequenciaFilterDto } from './dto/frequencia-filter.dto';
import { UpdateFrequenciaDto } from './dto/update-frequencia.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { Frequencia } from './entities/frequencia.entity';
import { StatusFrequencia } from './entities/frequencia.entity';
import {
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';


type AuthRequest = Request & { user?: Usuario | any };

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('frequencias')
export class FrequenciaController {
  constructor(private readonly frequenciaService: FrequenciaService) {}

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async create(
    @Body() createFrequenciaDto: CreateFrequenciaDto,
    @Req() req: AuthRequest,
  ): Promise<Frequencia> {
    return await this.frequenciaService.create(createFrequenciaDto, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async findAll(
    @Query() filters: FrequenciaFilterDto,
    @Req() req: AuthRequest,
  ): Promise<Frequencia[]> {
    return await this.frequenciaService.findAll(filters, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get('resumo')
  async resumo(
    @Query('alunoId',) alunoId: string,
    @Query('disciplinaId', ParseUUIDPipe) disciplinaId: string,
    @Query('turmaId', ParseUUIDPipe) turmaId: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('status') status?: StatusFrequencia,
    @Req() req?: AuthRequest,
  ) {
    return this.frequenciaService.resumo(
      alunoId,
      disciplinaId,
      turmaId,
      dataInicio,
      dataFim,
      status,
      req?.user,
    );
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR, Role.ALUNO)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<Frequencia> {
    return await this.frequenciaService.findOne(id, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFrequenciaDto: UpdateFrequenciaDto,
    @Req() req: AuthRequest,
  ): Promise<Frequencia> {
    return await this.frequenciaService.update(id, updateFrequenciaDto, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: StatusFrequencia,
    @Body('justificativa') justificativa?: string,
    @Req() req?: AuthRequest,
  ): Promise<Frequencia> {
    return this.frequenciaService.updateStatus(id, status, justificativa, req?.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Get('estatisticas/turma/:turmaId')
  async estatisticasTurma(
    @Param('turmaId', ParseUUIDPipe) turmaId: string,
    @Query('disciplinaId', ParseUUIDPipe) disciplinaId: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.frequenciaService.getEstatisticasTurma(
      turmaId,
      disciplinaId,
      dataInicio,
      dataFim,
    );
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthRequest,
  ): Promise<void> {
    return await this.frequenciaService.remove(id, req.user);
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Post(':id/justificativa')
  @UseInterceptors(FileInterceptor('arquivo'))
  async anexarJustificativa(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() arquivo: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    return this.frequenciaService.anexarJustificativa(
      id,
      arquivo,
      req.user,
    );
  }

}