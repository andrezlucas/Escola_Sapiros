import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';
import { AUDIT_KEY, AuditOptions } from './audit.decorator';
import { AuditService } from './audit.service';
import { getAuditAction } from './audit.actions';

type AuthRequest = Request & {
  user?: { id: string; role: string; turmaId?: string };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    const ip = request.ip ?? request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'] as string;

    return next.handle().pipe(
      tap({
        next: async (result) => {
          try {
            const entityId =
              auditOptions.entityIdPath && request.params
                ? request.params[auditOptions.entityIdPath]
                : undefined;

            const metadata = auditOptions.metadataBuilder
              ? auditOptions.metadataBuilder(request, result)
              : undefined;

            await this.auditService.log({
              usuario_id: user?.id,
              usuario_role: user?.role as any,
              acao: getAuditAction(auditOptions.action as any),
              entidade: auditOptions.entity,
              entidade_id: entityId,
              descricao: auditOptions.description,
              metadata,
              ip,
              user_agent: userAgent,
            });
          } catch (err) {
            this.logger.error('Falha ao gravar audit log', err);
          }
        },
        error: (err) => {
          this.logger.warn('AuditInterceptor: handler falhou, log não gerado', err);
        },
      }),
    );
  }
}
