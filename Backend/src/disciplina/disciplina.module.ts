import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Disciplina } from './entities/disciplina.entity';
import { DisciplinaService } from './disciplina.service';
import { DisciplinaController } from './disciplina.controller';

import { Turma } from '../turma/entities/turma.entity';
import { Professor } from '../professor/entities/professor.entity'; // ✅ IMPORTAR
import { Usuario } from '../usuario/entities/usuario.entity';
import { Habilidade } from './entities/habilidade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Disciplina,
      Turma,
      Professor,   
      Usuario,
      Habilidade, 
    ]),
  ],
  controllers: [DisciplinaController],
  providers: [DisciplinaService],
  exports: [DisciplinaService],
})
export class DisciplinaModule {}
