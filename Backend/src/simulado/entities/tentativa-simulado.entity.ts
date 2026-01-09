import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Simulado } from './simulado.entity';
import { Aluno } from '../../aluno/entities/aluno.entity';

@Entity('tentativas_simulados')
export class TentativaSimulado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', name: 'inicio_em' })
  inicioEm: Date;

  @Column({ type: 'timestamp', name: 'fim_previsto' })
  fimPrevisto: Date;

  @Column({ type: 'timestamp', name: 'entregue_em', nullable: true })
  entregueEm: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'nota_final' })
  notaFinal: number;

  @ManyToOne(() => Simulado)
  @JoinColumn({ name: 'simulado_id' })
  simulado: Simulado;

  @ManyToOne(() => Aluno)
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @CreateDateColumn({ name: 'criado_em' })
  criadoem: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoem: Date;
}