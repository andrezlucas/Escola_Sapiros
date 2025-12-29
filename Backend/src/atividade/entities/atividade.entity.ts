import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
  VersionColumn,
} from 'typeorm';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Turma } from '../../turma/entities/turma.entity';
import { Questao } from './questao.entity';
import { Professor } from '../../professor/entities/professor.entity';

@Entity('atividades')
export class Atividade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @VersionColumn()
  versao: number;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'timestamp', name: 'data_entrega' })
  dataEntrega: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  valor: number;

  @Column({ default: true })
  ativa: boolean;

  @ManyToOne(() => Professor, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'professor_id' })
  professor: Professor;

  @ManyToOne(() => Disciplina, disciplina => disciplina.atividades, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;

  @ManyToMany(() => Turma, turma => turma.atividades)
  @JoinTable({
    name: 'atividades_turmas',
    joinColumn: { name: 'atividade_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'turma_id' },
  })
  turmas: Turma[];

  @OneToMany(() => Questao, questao => questao.atividade, {
    cascade: true,
  })
  questoes: Questao[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoem: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoem: Date;
}


