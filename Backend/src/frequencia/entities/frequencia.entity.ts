import {  Entity,  PrimaryGeneratedColumn,  Column,  ManyToOne, JoinColumn,  CreateDateColumn,  UpdateDateColumn } from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Turma } from '../../turma/entities/turma.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Index } from 'typeorm';

export enum StatusFrequencia {
  PRESENTE = 'presente',
  FALTA = 'falta',
  FALTA_JUSTIFICADA = 'falta_justificada'
}

@Index(
  'UQ_frequencia_unica_por_dia',
  ['aluno', 'disciplina', 'turma', 'data'],
  { unique: true }
)

@Entity('frequencias')
export class Frequencia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  data: Date;

  @Column({ 
    type: 'enum',
    enum: StatusFrequencia,
    default: StatusFrequencia.PRESENTE
  })
  status: StatusFrequencia;

  @Column({ type: 'int', default: 0 })
  faltasNoPeriodo: number;

  @Column({ type: 'text', nullable: true })
  justificativa: string;

  @ManyToOne(() => Aluno, { nullable: false })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @ManyToOne(() => Turma, { nullable: false })
  @JoinColumn({ name: 'turma_id' })
  turma: Turma;

  @ManyToOne(() => Disciplina, { nullable: false })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}