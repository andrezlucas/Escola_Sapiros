import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RelatoriosHabilidadesService } from './relatorios-habilidades.service';
import { FiltroRelatorioDto, FiltroComparativoDto } from './dto/filtro-relatorio.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../usuario/entities/usuario.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('relatorios/performance')
export class RelatoriosHabilidadesController {
  constructor(private readonly service: RelatoriosHabilidadesService) {}

  @Get('habilidades')
  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  listarPorHabilidade(@Query() filtros: FiltroRelatorioDto) {
    return this.service.listarPorHabilidade(filtros);
  }

  @Get('comparativo-turmas')
  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  comparativoPorTurma(@Query() filtros: FiltroComparativoDto) {
    return this.service.comparativoPorTurma(filtros);
  }
}
