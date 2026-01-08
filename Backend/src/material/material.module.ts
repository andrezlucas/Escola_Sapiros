import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { Material } from './entities/material.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Aluno } from '../aluno/entities/aluno.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material, Professor, Turma, Disciplina, Aluno]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
