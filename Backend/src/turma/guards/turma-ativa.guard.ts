import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Turma } from '../entities/turma.entity';

@Injectable()
export class TurmaAtivaGuard implements CanActivate {
  constructor(
    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const turmaId =
      request.params?.turmaId || request.params?.id;

    if (!turmaId) return true;

    const turma = await this.turmaRepository.findOne({
      where: { id: turmaId },
    });

    if (!turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (!turma.ativa) {
      throw new ForbiddenException(
        'Operação não permitida: turma inativa',
      );
    }

    return true;
  }
}
