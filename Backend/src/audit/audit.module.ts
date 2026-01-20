import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AccessAuditMiddleware } from './access-audit.middleware';
import { SystemAuditService } from './system-audit.service';
import { AuditLog } from './entities/audit-log.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, Usuario])],
  controllers: [AuditController],
  providers: [AuditService, AccessAuditMiddleware, SystemAuditService],
  exports: [AuditService, SystemAuditService],
})
export class AuditModule {}
