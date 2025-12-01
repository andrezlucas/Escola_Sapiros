import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotaService } from './nota.service';
import { NotaController } from './nota.controller';
import { Nota } from './entities/nota.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nota, Aluno, Disciplina])],
  controllers: [NotaController],
  providers: [NotaService],
  exports: [NotaService],
})
export class NotaModule {}
