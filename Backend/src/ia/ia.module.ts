import { Module } from '@nestjs/common';
import { IaQuestoesService } from './ia-questoes.service';
import { IaSimpleService } from './ia-simple.service';
import { IaController } from './ia.controller';
import { IaQueryService } from './ia-query.service';
import { IaQueryIntentService } from './ia-query-intent.service';
import { IaQueryMapperService } from './ia-query-mapper.service';
import { IaQueryDbService } from './ia-query-db.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nota } from '../nota/entities/nota.entity';
import { Atividade } from '../atividade/entities/atividade.entity';
import { Entrega } from '../atividade/entities/entrega.entity';
import { Frequencia } from '../frequencia/entities/frequencia.entity';
import { Simulado } from '../simulado/entities/simulado.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';
import { Habilidade } from '../disciplina/entities/habilidade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Nota,
      Atividade,
      Entrega,
      Frequencia,
      Simulado,
      Aluno,
      Disciplina,
      Habilidade,
    ]),
  ],
  controllers: [IaController],
  providers: [
    IaQuestoesService,
    IaSimpleService,
    IaQueryService,
    IaQueryIntentService,
    IaQueryMapperService,
    IaQueryDbService,
  ],
  exports: [IaQuestoesService, IaSimpleService],
})
export class IaModule {}
