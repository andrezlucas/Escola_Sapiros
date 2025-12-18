import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { AuthModule } from '../auth/auth.module';
import { AlunoModule } from '../aluno/aluno.module';
import { MailModule } from '../mail/mail.module';
import { Turma } from '../turma/entities/turma.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Aluno } from '../aluno/entities/aluno.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Turma,
      Professor,
      Aluno,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => AlunoModule),
    forwardRef(() => MailModule),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}

