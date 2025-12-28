import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from './entities/professor.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { ProfessorService } from './professor.service';
import { ProfessorController } from './professor.controller';
import { AuthModule } from '../auth/auth.module';
import { Formacao } from './entities/formacao.entity';
import { Turma } from 'src/turma/entities/turma.entity';
import { Disciplina } from 'src/disciplina/entities/disciplina.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Professor, Usuario, Formacao,Turma,Disciplina]),
    AuthModule,
  ],
  controllers: [ProfessorController],
  providers: [ProfessorService],
})
export class ProfessorModule {}
