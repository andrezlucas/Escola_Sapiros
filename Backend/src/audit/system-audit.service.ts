import { Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/audit.actions';
import { Role } from '../usuario/entities/usuario.entity';

@Injectable()
export class SystemAuditService {
  private readonly logger = new Logger(SystemAuditService.name);

  constructor(private readonly auditService: AuditService) {}

  async logSystemEvent(
    action: keyof typeof AUDIT_ACTIONS,
    description: string,
    userId?: string,
    userRole?: Role,
    metadata?: Record<string, any>,
  ) {
    try {
      await this.auditService.log({
        usuario_id: userId || undefined,
        usuario_role: userRole,
        acao: AUDIT_ACTIONS[action],
        entidade: 'System',
        entidade_id: undefined,
        descricao: description,
        ip: undefined,
        user_agent: 'System',
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: 'SystemAuditService',
        },
      });

      this.logger.log(`System audit: ${AUDIT_ACTIONS[action]} - ${description}`);
    } catch (error) {
      this.logger.error('Failed to log system event:', error);
    }
  }

  async logBackup(
    backupType: string,
    filePath: string,
    size: number,
    userId?: string,
    userRole?: Role,
  ) {
    await this.logSystemEvent(
      'BACKUP_REALIZADO',
      `Backup ${backupType} realizado: ${filePath} (${size} bytes)`,
      userId,
      userRole,
      {
        backupType,
        filePath,
        size,
      },
    );
  }

  async logDataExport(
    exportType: string,
    recordCount: number,
    format: string,
    userId?: string,
    userRole?: Role,
  ) {
    await this.logSystemEvent(
      'EXPORTAR_DADOS',
      `Exportação de dados: ${exportType} - ${recordCount} registros em formato ${format}`,
      userId,
      userRole,
      {
        exportType,
        recordCount,
        format,
      },
    );
  }

  async logDataImport(
    importType: string,
    recordCount: number,
    success: boolean,
    userId?: string,
    userRole?: Role,
    errors?: string[],
  ) {
    await this.logSystemEvent(
      'IMPORTAR_DADOS',
      `Importação de dados: ${importType} - ${recordCount} registros - Sucesso: ${success}`,
      userId,
      userRole,
      {
        importType,
        recordCount,
        success,
        errors: errors || [],
      },
    );
  }

  async logReportGeneration(
    reportType: string,
    parameters: Record<string, any>,
    filePath?: string,
    userId?: string,
    userRole?: Role,
  ) {
    await this.logSystemEvent(
      'GERAR_RELATORIO',
      `Relatório gerado: ${reportType}`,
      userId,
      userRole,
      {
        reportType,
        parameters,
        filePath,
      },
    );
  }

  async logEmailSent(
    to: string[],
    subject: string,
    success: boolean,
    template?: string,
    error?: string,
    userId?: string,
    userRole?: Role,
  ) {
    await this.logSystemEvent(
      'ENVIAR_EMAIL',
      `Email enviado para ${to.length} destinatários: ${subject} - Sucesso: ${success}`,
      userId,
      userRole,
      {
        to,
        subject,
        template,
        success,
        error,
      },
    );
  }

  async logSecurityEvent(
    eventType: string,
    description: string,
    ip?: string,
    userAgent?: string,
    userId?: string,
    userRole?: Role,
    metadata?: Record<string, any>,
  ) {
    await this.logSystemEvent(
      'ACESSO_NEGADO',
      `Evento de segurança: ${eventType} - ${description}`,
      userId,
      userRole,
      {
        securityEventType: eventType,
        ip,
        userAgent,
        ...metadata,
      },
    );
  }
}
