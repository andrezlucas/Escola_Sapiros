import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditDto } from './dto/create-audit.dto';
import { truncate, sanitizeMetadata } from './audit.sanitize';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async log(dto: CreateAuditDto): Promise<void> {
    try {
      let userName = dto.usuario_nome;
      if (!userName && dto.usuario_id) {
        const usuario = await this.usuarioRepository.findOne({
          where: { id: dto.usuario_id },
          select: ['nome'],
        });
        userName = usuario?.nome;
      }

      const auditLog = this.auditRepository.create({
        usuario_id: dto.usuario_id,
        usuario_nome: userName ? truncate(userName, 255) : undefined,
        usuario_role: dto.usuario_role,
        acao: truncate(dto.acao, 255),
        entidade: dto.entidade ? truncate(dto.entidade, 100) : undefined,
        entidade_id: dto.entidade_id,
        descricao: dto.descricao ? truncate(dto.descricao, 2000) : undefined,
        metadata: dto.metadata ? sanitizeMetadata(dto.metadata) : undefined,
        ip: dto.ip,
        user_agent: dto.user_agent ? truncate(dto.user_agent, 255) : undefined,
      });

      await this.auditRepository.save(auditLog);
    } catch (err) {
      this.logger.error('Erro ao persistir AuditLog', err);
    }
  }

  async findAll(filters: {
    usuario_id?: string;
    acao?: string;
    entidade?: string;
    entidade_id?: string;
    usuario_role?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const qb = this.auditRepository.createQueryBuilder('audit');

    if (filters.usuario_id) qb.andWhere('audit.usuario_id = :uid', { uid: filters.usuario_id });
    if (filters.acao) qb.andWhere('audit.acao LIKE :acao', { acao: `%${filters.acao}%` });
    if (filters.entidade) qb.andWhere('audit.entidade = :ent', { ent: filters.entidade });
    if (filters.entidade_id) qb.andWhere('audit.entidade_id = :eid', { eid: filters.entidade_id });
    if (filters.usuario_role) qb.andWhere('audit.usuario_role = :role', { role: filters.usuario_role });
    if (filters.startDate) qb.andWhere('audit.criado_em >= :start', { start: filters.startDate });
    if (filters.endDate) qb.andWhere('audit.criado_em <= :end', { end: filters.endDate });

    qb.orderBy('audit.criado_em', 'DESC').skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async purge(before: Date): Promise<void> {
    try {
      const result = await this.auditRepository
        .createQueryBuilder()
        .delete()
        .where('criado_em < :before', { before })
        .execute();

      this.logger.log(`Purge executado: ${result.affected} registros removidos.`);
    } catch (err) {
      this.logger.error('Erro ao executar purge', err);
      throw err;
    }
  }
}
