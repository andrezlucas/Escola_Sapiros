import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Role } from '../../usuario/entities/usuario.entity';

@Entity('audit_logs')
@Index(['criado_em'])
@Index(['usuario_id'])
@Index(['acao'])
@Index(['entidade', 'entidade_id'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', type: 'char', length: 36, nullable: true })
  usuario_id?: string;

  @Column({ name: 'usuario_nome', type: 'varchar', length: 255, nullable: true })
  usuario_nome?: string;

  @Column({
    name: 'usuario_role',
    type: 'enum',
    enum: Role,
    nullable: true,
  })
  usuario_role?: Role;

  @Column({ type: 'varchar', length: 255 })
  acao: string;

  @Column({ name: 'entidade', type: 'varchar', length: 100, nullable: true })
  entidade?: string;

  @Column({
    name: 'entidade_id',
    type: 'char',
    length: 36,
    nullable: true,
  })
  entidade_id?: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip?: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 255, nullable: true })
  user_agent?: string;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;
}
