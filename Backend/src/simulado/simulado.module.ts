import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimuladoService } from './simulado.service';
import { SimuladoController } from './simulado.controller';
import { Simulado } from './entities/simulado.entity';
import { TentativaSimulado } from './entities/tentativa-simulado.entity';
import { Questao } from '../atividade/entities/questao.entity';
import { Alternativa } from '../atividade/entities/alternativa.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';
import { IaModule } from '../ia/ia.module'; // importa o módulo da IA

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Simulado,
      TentativaSimulado,
      Questao,
      Alternativa,
      Disciplina,
      Turma,
    ]),
    IaModule, // adiciona aqui
  ],
  controllers: [SimuladoController],
  providers: [SimuladoService],
})
export class SimuladoModule {}
