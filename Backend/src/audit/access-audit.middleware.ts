import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/audit.actions';

@Injectable()
export class AccessAuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AccessAuditMiddleware.name);

  constructor(private readonly auditService: AuditService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    // Capturar resposta para registrar após o processamento
    const originalSend = res.send;
    let responseData: any;
    
    res.send = function(data: any) {
      responseData = data;
      return originalSend.call(this, data);
    };

    // Continuar com o processamento
    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      await this.logResourceAccess(req, res, duration, responseData);
    });

    next();
  }

  private async logResourceAccess(
    req: Request,
    res: Response,
    duration: number,
    responseData: any,
  ) {
    const url = req.url;
    const method = req.method;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';

    // Verificar se é um acesso a recurso que deve ser auditado
    if (this.shouldAuditAccess(url, method, res.statusCode)) {
      const user = (req as any).user;
      const userId = user?.id || null;
      const userRole = user?.role || null;

      let auditAction = '';
      let description = '';
      let entity = '';
      let entityId: string | undefined = undefined;

      // Identificar tipo de acesso
      if (url.includes('/download') || url.includes('/arquivo')) {
        auditAction = AUDIT_ACTIONS.BAIXAR_ARQUIVO;
        description = `Baixou arquivo: ${this.extractFileName(url, responseData)}`;
        entity = 'Arquivo';
      } else if (url.includes('/relatorio') || url.includes('/exportar')) {
        auditAction = AUDIT_ACTIONS.EXPORTAR_DADOS;
        description = `Gerou relatório: ${url}`;
        entity = 'Relatorio';
      } else if (method === 'GET' && res.statusCode === 200 && !url.includes('/admin')) {
        auditAction = AUDIT_ACTIONS.ACESSAR_RECURSO;
        description = `Acessou recurso: ${method} ${url}`;
        entity = 'Recurso';
      }

      if (auditAction) {
        // Extrair ID da entidade da URL
        entityId = this.extractEntityId(url) || undefined;

        // Log de acesso
        this.logger.log(
          `Access: ${auditAction} - User: ${userId || 'anonymous'} - IP: ${ip} - ${method} ${url} (${duration}ms)`,
        );

        // Registrar no audit log de forma assíncrona e resiliente
        try {
          await this.auditService.log({
            usuario_id: userId,
            usuario_role: userRole,
            acao: auditAction,
            entidade: entity,
            entidade_id: entityId,
            descricao: description,
            ip,
            user_agent: userAgent,
            metadata: {
              url,
              method,
              statusCode: res.statusCode,
              duration,
              responseSize: this.getResponseSize(responseData),
            },
          });
        } catch (auditError) {
          // Não propagar erro de auditoria para não afetar o fluxo principal
          this.logger.error('Failed to log access event:', auditError);
        }
      }
    }
  }

  private shouldAuditAccess(url: string, method: string, statusCode: number): boolean {
    // Não auditar requisições de arquivos estáticos, health checks, etc.
    const skipPatterns = [
      '/health',
      '/favicon.ico',
      '.js',
      '.css',
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.ico',
      '/admin/audit', // Evitar loop de auditoria
    ];

    // Não auditar requisições com erro
    if (statusCode >= 400) return false;

    // Verificar se URL não contém padrões a serem ignorados
    return !skipPatterns.some(pattern => url.includes(pattern));
  }

  private extractEntityId(url: string): string | undefined {
    // Extrair UUID da URL (ex: /turmas/123abc -> 123abc)
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    const match = url.match(uuidRegex);
    return match ? match[0] : undefined;
  }

  private extractFileName(url: string, responseData: any): string {
    // Tentar extrair nome do arquivo da URL ou resposta
    if (url.includes('/download')) {
      const parts = url.split('/');
      return parts[parts.length - 1] || 'arquivo';
    }

    // Tentar extrair do response data
    if (responseData && responseData.filename) {
      return responseData.filename;
    }

    return 'arquivo';
  }

  private getResponseSize(responseData: any): number {
    if (!responseData) return 0;
    
    if (typeof responseData === 'string') {
      return responseData.length;
    }
    
    if (responseData && responseData.buffer) {
      return responseData.buffer.length || 0;
    }
    
    return JSON.stringify(responseData).length;
  }
}
