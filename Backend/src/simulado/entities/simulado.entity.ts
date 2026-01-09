import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinColumn,
  JoinTable,
  VersionColumn,
} from 'typeorm';
import { Turma } from '../../turma/entities/turma.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Questao } from '../../atividade/entities/questao.entity';
import { Professor } from '../../professor/entities/professor.entity';
import { Bimestre } from '../../shared/enums/bimestre.enum';

@Entity('simulados')
export class Simulado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @VersionColumn()
  versao: number;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'enum', enum: Bimestre })
  bimestre: Bimestre;

  @Column({ type: 'timestamp', name: 'data_inicio' })
  dataInicio: Date;

  @Column({ type: 'timestamp', name: 'data_fim' })
  dataFim: Date;

  @Column({ type: 'int', name: 'tempo_duracao' })
  tempoDuracao: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'valor_total' })
  valorTotal: number;

  @Column({ default: true })
  ativo: boolean;

  @ManyToOne(() => Professor, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'professor_id' })
  professor: Professor;

  @ManyToOne(() => Disciplina, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;

  @ManyToMany(() => Turma)
  @JoinTable({
    name: 'simulados_turmas',
    joinColumn: { name: 'simulado_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'turma_id' },
  })
  turmas: Turma[];

  @OneToMany(() => Questao, (questao) => questao.simulado, {
    cascade: true,
    orphanedRowAction: 'delete',
  })
  questoes: Questao[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoem: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoem: Date;
}