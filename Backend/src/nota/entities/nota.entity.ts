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

@Entity('notas')
export class Nota {
  @PrimaryGeneratedColumn('uuid')
  id: string; // Corrigido: id_nota -> id

  @Column('decimal', { precision: 5, scale: 2 })
  valor: number;

  @Column({
    type: 'enum',
    enum: TipoAvaliacao,
    default: TipoAvaliacao.PROVA,
    name: 'tipo_avaliacao' // Adicionado nome da coluna para snake_case
  })
  tipoAvaliacao: TipoAvaliacao;

  @Column({ type: 'date' })
  data: Date;

  @Column('text', { nullable: true })
  observacao: string;

  @ManyToOne(() => Aluno, { nullable: false })
  @JoinColumn({ name: 'aluno_id' }) // Corrigido: referencedColumnName removido ou apontando para 'id' (padrão)
  aluno: Aluno;

  @ManyToOne(() => Disciplina, { nullable: false })
  @JoinColumn({ name: 'disciplina_id' }) // Corrigido: referencedColumnName removido ou apontando para 'id' (padrão)
  disciplina: Disciplina;

  @CreateDateColumn({ name: 'criado_em' }) // Corrigido: notacriadoEm -> criadoEm
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' }) // Corrigido: notaatualizadoEm -> atualizadoEm
  atualizadoEm: Date;
}