import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';
import { AuditService } from './audit.service';
import { AUDIT_ACTIONS } from './audit.actions';

@Injectable()
export class SecurityAuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityAuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const handler = context.getHandler();
    const className = context.getClass().name;
    const methodName = handler.name;

    return next.handle().pipe(
      catchError((error) => {
        this.logSecurityEvent(request, error, className, methodName);
        return throwError(() => error);
      }),
    );
  }

  private async logSecurityEvent(
    request: Request,
    error: any,
    className: string,
    methodName: string,
  ) {
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent') || '';
    const url = request.url;
    const method = request.method;

    let auditAction = '';
    let description = '';

    // Identificar tipo de erro e mapear para ação de auditoria
    if (error instanceof UnauthorizedException) {
      auditAction = AUDIT_ACTIONS.ACESSO_NEGADO;
      description = `Acesso negado em ${method} ${url}`;
    } else if (error instanceof ForbiddenException) {
      auditAction = AUDIT_ACTIONS.ACESSO_NEGADO;
      description = `Permissão insuficiente em ${method} ${url}`;
    } else if (error instanceof BadRequestException) {
      // Verificar se é erro de login
      if (url.includes('/auth/login')) {
        auditAction = AUDIT_ACTIONS.LOGIN_FALHO;
        description = `Tentativa de login falhou para email: ${request.body?.email || 'desconhecido'}`;
      } else {
        auditAction = AUDIT_ACTIONS.ACESSO_NEGADO;
        description = `Requisição inválida em ${method} ${url}`;
      }
    } else {
      // Outros erros
      auditAction = AUDIT_ACTIONS.ACESSO_NEGADO;
      description = `Erro em ${method} ${url}: ${error.message}`;
    }

    // Extrair informações do usuário se disponível
    const user = (request as any).user;
    const userId = user?.id || null;
    const userRole = user?.role || null;

    // Log de segurança
    this.logger.warn(
      `Security Event: ${auditAction} - ${description} - IP: ${ip} - User: ${userId || 'anonymous'}`,
    );

    // Registrar no audit log de forma assíncrona e resiliente
    try {
      await this.auditService.log({
        usuario_id: userId,
        usuario_role: userRole,
        acao: auditAction,
        entidade: 'SecurityEvent',
        entidade_id: undefined,
        descricao: description,
        ip,
        user_agent: userAgent,
        metadata: {
          url,
          method,
          className,
          methodName,
          errorMessage: error.message,
          requestBody: this.sanitizeRequestBody(request.body),
        },
      });
    } catch (auditError) {
      // Não propagar erro de auditoria para não afetar o fluxo principal
      this.logger.error('Failed to log security event:', auditError);
    }
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return null;

    const sanitized = { ...body };
    
    // Remover campos sensíveis
    const sensitiveFields = ['senha', 'password', 'token', 'codigo', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}
