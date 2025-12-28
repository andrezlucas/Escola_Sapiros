import { Controller, Get, Post, Body, Param, Put, Delete, ParseUUIDPipe } from '@nestjs/common';
import { AtividadeService } from './atividade.service';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';

@Controller('atividades')
export class AtividadeController {
  constructor(private readonly atividadeService: AtividadeService) {}

  @Post()
  create(@Body() createAtividadeDto: CreateAtividadeDto) {
    return this.atividadeService.create(createAtividadeDto);
  }

  @Get()
  findAll() {
    return this.atividadeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.atividadeService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAtividadeDto: UpdateAtividadeDto,
  ) {
    return this.atividadeService.update(id, updateAtividadeDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.atividadeService.remove(id);
  }

  // Endpoints para gerenciar questões
  @Get(':atividadeId/questoes')
  async findQuestoes(@Param('atividadeId', ParseUUIDPipe) atividadeId: string) {
    const atividade = await this.atividadeService.findOne(atividadeId);
    return atividade.questoes;
  }

  @Get(':atividadeId/questoes/:questaoId')
  async findQuestao(
    @Param('atividadeId', ParseUUIDPipe) atividadeId: string,
    @Param('questaoId', ParseUUIDPipe) questaoId: string,
  ) {
    return this.atividadeService.findQuestao(atividadeId, questaoId);
  }


}