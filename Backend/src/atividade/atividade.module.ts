import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Atividade } from './entities/atividade.entity';
import { Questao } from './entities/questao.entity';
import { Alternativa } from './entities/alternativa.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Habilidade } from '../disciplina/entities/habilidade.entity';

import { AtividadeService } from './atividade.service';
import { AtividadeController } from './atividade.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Atividade,
      Questao,
      Alternativa,
      Disciplina,
      Turma,
      Habilidade,
    ]),
  ],
  controllers: [AtividadeController],
  providers: [AtividadeService],
})
export class AtividadeModule {}
