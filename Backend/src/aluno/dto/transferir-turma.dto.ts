import { IsUUID } from 'class-validator';

export class TransferirTurmaDto {
  @IsUUID()
  turmaId: string;
}
