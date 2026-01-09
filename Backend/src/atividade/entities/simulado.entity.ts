import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, VersionColumn, ManyToMany,JoinTable,} from 'typeorm';
import { Turma } from '../../turma/entities/turma.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Questao } from './questao.entity';
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

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'enum',
    enum: Bimestre,
    name: 'bimestre'
  })
  bimestre: Bimestre;

  @Column({ type: 'timestamp', name: 'data_inicio' })
  dataInicio: Date;

  @Column({ type: 'timestamp', name: 'data_fim' })
  dataFim: Date;

  @Column({ type: 'int', name: 'tempo_duracao' })
  tempoDuracao: number;

  @Column({ type: 'timestamp', nullable: true, name: 'inicio_da_prova' })
  iniciodaprova: Date; //Registra quando o aluno inicia o simulado

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true, name: 'valor_total' })
  valortotal: number; //Valor total do simulado

  @Column({ default: true })
  ativo: boolean;

  @ManyToOne(() => Professor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'professor_id' })
  professor: Professor;

  @ManyToOne(() => Disciplina, disciplina => disciplina.simulados, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;

  @ManyToMany(() => Turma, (turma) => turma.simulados)
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