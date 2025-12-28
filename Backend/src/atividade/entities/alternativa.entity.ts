import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,ManyToOne, JoinColumn } from 'typeorm';
import { Questao } from './questao.entity';

@Entity('alternativas')
export class Alternativa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  texto: string;

  @Column({ default: false })
  correta: boolean;

  @Column({ type: 'varchar', length: 1, nullable: true }) // A, B, C, D, etc.
  letra: string;

  @ManyToOne(() => Questao, questao => questao.alternativas, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'questao_id' })
  questao: Questao;

  @CreateDateColumn({ name: 'criado_em' })
  criadoem: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoem: Date;
}