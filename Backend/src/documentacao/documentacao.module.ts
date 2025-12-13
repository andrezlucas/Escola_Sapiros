

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Aluno } from '../aluno/entities/aluno.entity';
import { Documento } from './entities/documento.entity';
import { Usuario } from '../usuario/entities/usuario.entity'; 
import { AlunoModule } from 'src/aluno/aluno.module';
import { Documentacao } from './entities/documentacao.entity';
import { DocumentacaoService } from './documentacao.service';
import { DocumentacaoController } from './documentacao.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Documentacao,
      Documento,
      Aluno,
      Usuario, 
    ]),
    forwardRef(() => AlunoModule) 
  ],
  controllers: [DocumentacaoController],
  providers: [DocumentacaoService],
  exports: [DocumentacaoService],
})
export class DocumentacaoModule {}