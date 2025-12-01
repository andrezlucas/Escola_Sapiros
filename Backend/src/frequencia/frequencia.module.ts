import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FrequenciaService } from './frequencia.service';
import { FrequenciaController } from './frequencia.controller';
import { Frequencia } from './entities/frequencia.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Frequencia, Aluno, Disciplina])],
  controllers: [FrequenciaController],
  providers: [FrequenciaService],
  exports: [FrequenciaService],
})
export class FrequenciaModule {}
