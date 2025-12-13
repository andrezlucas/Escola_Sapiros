import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentacaoController } from './documentacao.controller';
import { DocumentacaoService } from './documentacao.service';
import { Documentacao } from './entities/documentacao.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Documento } from './entities/documento.entity';
import { AlunoModule } from 'src/aluno/aluno.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Documentacao,
      Aluno,
      Documento,
    ]),
    AlunoModule
  ],
  controllers: [DocumentacaoController],
  providers: [DocumentacaoService],
  exports: [DocumentacaoService],
})
export class DocumentacaoModule {}
