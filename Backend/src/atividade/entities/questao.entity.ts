import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Atividade } from './atividade.entity';
import { Alternativa } from './alternativa.entity';
import { Habilidade } from '../../disciplina/entities/habilidade.entity';
import { Simulado } from '../../atividade/entities/simulado.entity';

@Entity('questoes')
export class Questao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  enunciado: string;

  @Column({
    type: 'enum',
    enum: ['MULTIPLA_ESCOLHA', 'DISSERTATIVA', 'VERDADEIRO_FALSO'],
    default: 'MULTIPLA_ESCOLHA',
  })
  tipo: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  valor: number;

  @ManyToOne(() => Atividade, atividade => atividade.questoes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'atividade_id' })
  atividade: Atividade;

  @OneToMany(() => Alternativa, alternativa => alternativa.questao, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  alternativas: Alternativa[];

  @ManyToMany(() => Habilidade)
  @JoinTable({
    name: 'questoes_habilidades',
    joinColumn: { name: 'questao_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'habilidade_id', referencedColumnName: 'id' },
  })
  habilidades: Habilidade[];

  @ManyToOne(() => Simulado, (simulado) => simulado.questoes, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'simulado_id' })
  simulado: Simulado;
  

  @CreateDateColumn({ name: 'criado_em' })
  criadoem: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoem: Date;
}
