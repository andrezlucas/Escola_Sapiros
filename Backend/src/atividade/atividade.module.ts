import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Atividade } from './entities/atividade.entity';
import { Questao } from './entities/questao.entity';
import { Alternativa } from './entities/alternativa.entity';
import { AtividadeController } from './atividade.controller';
import { AtividadeService } from './atividade.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Atividade, Questao, Alternativa]),
   
  ],
  controllers: [AtividadeController],
  providers: [AtividadeService],
  exports: [AtividadeService], 
})
export class AtividadeModule {}