import {
  Controller,
  Get,
  Delete,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { FilterAuditDto } from './dto/filter-audit.dto';
import { PurgeAuditDto } from './dto/purge-audit.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../usuario/entities/usuario.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Roles(Role.COORDENACAO)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Query() filters: FilterAuditDto) {
    const { page, limit, ...rest } = filters;
    const startDate = filters.startDate ? new Date(filters.startDate) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate) : undefined;

    return this.auditService.findAll({
      ...rest,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  @Roles(Role.COORDENACAO)
  @Delete('purge')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async purge(@Query() dto: PurgeAuditDto) {
    if (!dto.before) {
      throw new Error('Parâmetro before (YYYY-MM-DD) é obrigatório para purge.');
    }
    await this.auditService.purge(new Date(dto.before));
    return { message: 'Purge concluído com sucesso.' };
  }
}
