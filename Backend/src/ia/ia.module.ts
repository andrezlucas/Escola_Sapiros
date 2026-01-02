import { Module } from '@nestjs/common';
import { IaQuestoesService } from './ia-questoes.service';

@Module({
  providers: [IaQuestoesService],
  exports: [IaQuestoesService],
})
export class IaModule {}
