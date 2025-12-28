import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,ManyToOne, JoinColumn,OneToMany } from 'typeorm';
import { Atividade } from './atividade.entity';
import { Alternativa } from './alternativa.entity';

@Entity('questoes')
export class Questao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  enunciado: string;

  @Column({ type: 'enum', enum: ['MULTIPLA_ESCOLHA', 'DISSERTATIVA', 'VERDADEIRO_FALSO'], default: 'MULTIPLA_ESCOLHA' })
  tipo: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  valor: number;

  @ManyToOne(() => Atividade, atividade => atividade.questoes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'atividade_id' })
  atividade: Atividade;

  @OneToMany(() => Alternativa, alternativa => alternativa.questao, { cascade: true })
  alternativas: Alternativa[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoem: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoem: Date;
}