import {
  Controller,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../usuario/entities/usuario.entity';
import { IaQueryIntentService } from './ia-query-intent.service';
import { IaQueryMapperService } from './ia-query-mapper.service';
import { IaQueryService } from './ia-query.service';

@Controller('ia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IaController {
  constructor(private readonly iaQueryService: IaQueryService) {}

  @Post('perguntar')
  @Roles(Role.PROFESSOR, Role.COORDENACAO)
  async perguntar(@Body('pergunta') pergunta: string) {
    if (!pergunta || typeof pergunta !== 'string') {
      throw new BadRequestException('Pergunta inválida');
    }

    const resultado = await this.iaQueryService.perguntar(pergunta);

    return {
      pergunta,
      resultado,
    };
  }
}
