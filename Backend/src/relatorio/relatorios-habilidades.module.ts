import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelatoriosHabilidadesController } from './relatorios-habilidades.controller';
import { RelatoriosHabilidadesService } from './relatorios-habilidades.service';
import { RespostaQuestao } from '../atividade/entities/resposta-questao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RespostaQuestao])],
  controllers: [RelatoriosHabilidadesController],
  providers: [RelatoriosHabilidadesService],
  exports: [RelatoriosHabilidadesService],
})
export class RelatoriosHabilidadesModule {}