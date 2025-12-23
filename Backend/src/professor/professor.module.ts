import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Professor } from './entities/professor.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { ProfessorService } from './professor.service';
import { ProfessorController } from './professor.controller';
import { AuthModule } from '../auth/auth.module';
import { Formacao } from './entities/formacao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Professor, Usuario, Formacao]),
    AuthModule,
  ],
  controllers: [ProfessorController],
  providers: [ProfessorService],
})
export class ProfessorModule {}
