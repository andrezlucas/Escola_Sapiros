import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmissaoDocumentosService } from './emissao-documentos.service';
import { DocumentosController } from './emissao-documentos.controller';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Nota } from '../nota/entities/nota.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Frequencia } from '../frequencia/entities/frequencia.entity';
import { SolicitacaoDocumento } from './entities/emissao-documentos.entity';
import { SolicitacaoDocumentoService } from './solicitacao-documentos.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      Aluno,
      Nota,
      Turma,
      Disciplina,
      Frequencia,
      SolicitacaoDocumento,
      Usuario,
    ]),
  ],
  controllers: [DocumentosController],
  providers: [EmissaoDocumentosService, SolicitacaoDocumentoService],
  exports: [EmissaoDocumentosService, SolicitacaoDocumentoService],
})
export class EmissaoDocumentosModule {}
