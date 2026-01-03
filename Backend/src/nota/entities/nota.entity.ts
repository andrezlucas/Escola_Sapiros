import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';

export enum TipoAvaliacao {
  PROVA = 'PROVA',
  TRABALHO = 'TRABALHO',
  PROJETO = 'PROJETO',
  ATIVIDADE = 'ATIVIDADE',
  OUTRO = 'OUTRO'
}

export enum NotaStatus {
  SALVO = 'SALVO',
  PENDENTE = 'PENDENTE'
}

@Entity('notas')
export class Nota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  valor: number;

  @Column({
    type: 'enum',
    enum: TipoAvaliacao,
    default: TipoAvaliacao.PROVA,
    name: 'tipo_avaliacao'
  })
  tipoAvaliacao: TipoAvaliacao;

  @Column({ name: 'avaliacao_nome', nullable: true })
  avaliacaoNome: string;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'json', nullable: true })
  habilidades: any;

  @Column({
    type: 'enum',
    enum: NotaStatus,
    default: NotaStatus.PENDENTE
  })
  status: NotaStatus;

  @Column({ type: 'date' })
  data: Date;

  @ManyToOne(() => Aluno, { nullable: false })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @ManyToOne(() => Disciplina, { nullable: false })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}