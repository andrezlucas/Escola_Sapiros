import { Entity, PrimaryGeneratedColumn, Column, ManyToOne,JoinColumn,CreateDateColumn, UpdateDateColumn,} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Turma } from '../../turma/entities/turma.entity';

export enum TipoAviso {
  GERAL = 'GERAL',
  TURMA = 'TURMA',
  INDIVIDUAL = 'INDIVIDUAL',
}

@Entity('avisos')
export class Aviso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column('text')
  descricao: string;

  @Column({
    type: 'enum',
    enum: TipoAviso,
    default: TipoAviso.GERAL,
  })
  tipo: TipoAviso;

  @Column({ name: 'data_inicio', type: 'timestamp' })
  dataInicio: Date;

  @Column({ name: 'data_final', type: 'timestamp', nullable: true })
  datafinal?: Date;

  // autor do aviso (quem criou)
  @ManyToOne(() => Usuario, { nullable: false, eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  // turma alvo (quando tipo === TURMA)
  @ManyToOne(() => Turma, { nullable: true, eager: true })
  @JoinColumn({ name: 'turma_id' })
  turma?: Turma | null;

  /*
   * Destinatário quando tipo === INDIVIDUAL.
   * Aqui usamos o id do ALUNO (Aluno.id) para identificar o destinatário.
   */

  @Column({ name: 'destinatario_aluno_id', type: 'uuid', nullable: true })
  destinatarioAlunoId?: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
