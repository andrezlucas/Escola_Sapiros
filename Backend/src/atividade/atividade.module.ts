import { Module, Res } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Atividade } from './entities/atividade.entity';
import { Questao } from './entities/questao.entity';
import { Alternativa } from './entities/alternativa.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Habilidade } from '../disciplina/entities/habilidade.entity';

import { AtividadeService } from './atividade.service';
import { AtividadeController } from './atividade.controller';
import { Entrega } from './entities/entrega.entity';
import { RespostaQuestao } from './entities/resposta-questao.entity';
import { IaModule } from 'src/ia/ia.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Atividade,
      Questao,
      Alternativa,
      Disciplina,
      Entrega,
      RespostaQuestao,
      Turma,
      Habilidade,
    ]),
    IaModule,
  ],
  controllers: [AtividadeController],
  providers: [AtividadeService],
})
export class AtividadeModule {}
