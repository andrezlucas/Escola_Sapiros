import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, JoinColumn } from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Atividade } from './atividade.entity';
import { RespostaQuestao } from './resposta-questao.entity';

@Entity('entregas_atividades')
export class Entrega {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Aluno, { nullable: false })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @ManyToOne(() => Atividade, { nullable: false })
  @JoinColumn({ name: 'atividade_id' })
  atividade: Atividade;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  notaFinal: number;

  @CreateDateColumn({ name: 'data_entrega' })
  dataEntrega: Date;

  @OneToMany(() => RespostaQuestao, (resposta) => resposta.entrega, { cascade: true })
  respostas: RespostaQuestao[];
}