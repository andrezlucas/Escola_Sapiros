import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';

@Entity('frequencias')
export class Frequencia {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Corrigido: id_frequencia -> id

  @Column({ type: 'date' })
  data: Date;

  @Column({ default: false })
  presente: boolean;

  @Column({ type: 'text', nullable: true })
  observacao: string;

  @ManyToOne(() => Aluno, { nullable: false })
  @JoinColumn({ name: 'aluno_id' }) // Corrigido: referencedColumnName removido ou apontando para 'id' (padrão)
  aluno: Aluno;

  @ManyToOne(() => Disciplina, { nullable: false })
  @JoinColumn({ name: 'disciplina_id' }) // Corrigido: id_disciplina -> disciplina_id (para consistência) e referencedColumnName removido
  disciplina: Disciplina;

  @CreateDateColumn({ name: 'criado_em' }) // Corrigido: frequenciacriadoEm -> criadoEm
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' }) // Corrigido: frequenciaatualizadoEm -> atualizadoEm
  atualizadoEm: Date;
}