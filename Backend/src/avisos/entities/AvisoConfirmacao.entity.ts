import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Aviso } from './aviso.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('avisos_confirmacoes')
export class AvisoConfirmacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Aviso, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'aviso_id' })
  aviso: Aviso;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @CreateDateColumn({ name: 'confirmado_em' })
  confirmadoEm: Date;
}
