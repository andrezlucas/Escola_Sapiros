import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Importante
import { MailService } from 'src/mail/mail.service';
import { EmissaoDocumentosService } from './emissao-documentos.service';
import { SolicitacaoDocumentoService } from './solicitacao-documentos.service';
import { DocumentosController } from './emissao-documentos.controller';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Nota } from '../nota/entities/nota.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { Frequencia } from '../frequencia/entities/frequencia.entity';
import { SolicitacaoDocumento } from './entities/emissao-documentos.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Module({
  imports: [
    ConfigModule, // Adicione aqui para o MailService funcionar
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
  providers: [
    EmissaoDocumentosService, 
    SolicitacaoDocumentoService, 
    MailService // Deve estar aqui como provider
  ],
  exports: [EmissaoDocumentosService, SolicitacaoDocumentoService],
})
export class EmissaoDocumentosModule {}
