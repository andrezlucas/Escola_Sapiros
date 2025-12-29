import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Entrega } from './entrega.entity';
import { Questao } from './questao.entity';
import { Alternativa } from './alternativa.entity';

@Entity('respostas_questoes')
export class RespostaQuestao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Entrega, (entrega) => entrega.respostas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entrega_id' })
  entrega: Entrega;

  @ManyToOne(() => Questao, { nullable: false })
  @JoinColumn({ name: 'questao_id' })
  questao: Questao;

  // Para múltipla escolha
  @ManyToOne(() => Alternativa, { nullable: true })
  @JoinColumn({ name: 'alternativa_id' })
  alternativaEscolhida?: Alternativa;

  // Para dissertativas
  @Column({ type: 'text', nullable: true })
  textoResposta?: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  notaAtribuida: number;
}