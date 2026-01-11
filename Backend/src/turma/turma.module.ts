import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TurmaService } from './turma.service';
import { TurmaController } from './turma.controller';
import { Turma } from './entities/turma.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Professor } from '../professor/entities/professor.entity';
import { TurmaAtivaGuard } from './guards/turma-ativa.guard';
import { Habilidade } from 'src/disciplina/entities/habilidade.entity';
import { Atividade } from 'src/atividade/entities/atividade.entity';
import { Nota } from 'src/nota/entities/nota.entity';
import { Entrega } from 'src/atividade/entities/entrega.entity';
import { AtividadeModule } from 'src/atividade/atividade.module';

@Module({
  imports: [TypeOrmModule.forFeature([Turma, Aluno, Disciplina, Professor, Habilidade, Atividade, Nota, Entrega]),
AtividadeModule],
  controllers: [TurmaController],
  providers: [TurmaService, TurmaAtivaGuard],
  exports: [TurmaService],
})
export class TurmaModule {}
