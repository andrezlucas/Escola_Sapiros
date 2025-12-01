import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisciplinaService } from './disciplina.service';
import { DisciplinaController } from './disciplina.controller';
import { Disciplina } from './entities/disciplina.entity';
import { Turma } from '../turma/entities/turma.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Disciplina, Turma])],
  controllers: [DisciplinaController],
  providers: [DisciplinaService],
  exports: [DisciplinaService],
})
export class DisciplinaModule {}
