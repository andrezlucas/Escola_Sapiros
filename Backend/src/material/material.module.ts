import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { Material } from './entities/material.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material, Professor, Turma, Disciplina]),
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
  exports: [MaterialService],
})
export class MaterialModule {}
