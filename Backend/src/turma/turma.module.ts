import { Module } from '@nestjs/common';
import { TurmaService } from './turma.service';
import { TurmaController } from './turma.controller';

@Module({
  controllers: [TurmaController],
  providers: [TurmaService],
})
export class TurmaModule {}
