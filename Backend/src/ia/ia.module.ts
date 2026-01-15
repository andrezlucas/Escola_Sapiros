import { Module } from '@nestjs/common';
import { IaQuestoesService } from './ia-questoes.service';
import { IaSimpleService } from './ia-simple.service';
import { IaController } from './ia.controller';

@Module({
  controllers: [IaController],
  providers: [IaQuestoesService, IaSimpleService],
  exports: [IaQuestoesService, IaSimpleService],
})
export class IaModule {}
