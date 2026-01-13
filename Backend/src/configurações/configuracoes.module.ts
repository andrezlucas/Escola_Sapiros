import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfiguracoesController } from './configuracoes.controller';
import { ConfiguracoesService } from './configuracoes.service';

import { Usuario } from '../usuario/entities/usuario.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Coordenacao } from '../coordenacao/entities/coordenacao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Aluno,
      Professor,
      Coordenacao,
    ]),
  ],
  controllers: [ConfiguracoesController],
  providers: [ConfiguracoesService],
})
export class ConfiguracoesModule {}
