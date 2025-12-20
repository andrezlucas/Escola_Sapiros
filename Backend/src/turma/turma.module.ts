import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurmaService } from './turma.service';
import { TurmaController } from './turma.controller';
import { Turma } from './entities/turma.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Professor } from '../professor/entities/professor.entity';
import { TurmaAtivaGuard } from './guards/turma-ativa.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Turma, Aluno, Disciplina, Professor])],
  controllers: [TurmaController],
  providers: [TurmaService, TurmaAtivaGuard],
  exports: [TurmaService],
})
export class TurmaModule {}
