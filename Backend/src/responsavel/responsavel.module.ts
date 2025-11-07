import { Module } from '@nestjs/common';
import { ResponsavelService } from './responsavel.service';
import { ResponsavelController } from './responsavel.controller';

@Module({
  controllers: [ResponsavelController],
  providers: [ResponsavelService],
})
export class ResponsavelModule {}
