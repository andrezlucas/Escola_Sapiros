import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aluno } from './entities/aluno.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Documentacao } from '../documentacao/entities/documentacao.entity';
import { AlunoService } from './aluno.service';
import { AlunoController } from './aluno.controller';
import { AuthModule } from '../auth/auth.module';
import { UsuarioModule } from '../usuario/usuario.module';
import { MailModule } from '../mail/mail.module';
import { DocumentacaoModule } from 'src/documentacao/documentacao.module';
import { Habilidade } from '../disciplina/entities/habilidade.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Aluno,
      Usuario,
      Turma,
      Documentacao,
      Habilidade,
    ]),
    
    forwardRef(() => AuthModule),
    forwardRef(() => UsuarioModule),
    forwardRef(() => DocumentacaoModule),
    
    MailModule,
  ],
  controllers: [AlunoController],
  providers: [AlunoService],
  exports: [AlunoService],
})
export class AlunoModule {}