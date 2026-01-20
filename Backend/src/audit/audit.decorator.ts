import { SetMetadata } from '@nestjs/common';
import { AuditActionKey } from './audit.actions';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  action: AuditActionKey | string;
  entity?: string;
  entityIdPath?: string;
  description?: string;
  metadataBuilder?: (req: any, result: any) => Record<string, any>;
}

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options);
