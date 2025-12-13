import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, ManyToOne, JoinColumn,} from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Aviso } from '../../avisos/entities/aviso.entity';
import { Professor } from '../../professor/entities/professor.entity';


@Entity('turmas')
export class Turma {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome_turma' })
  nomeTurma: string;

  @Column({ name: 'ano_letivo' })
  anoLetivo: string;

  @Column()
  periodo: string; 

  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'date' })
  dataFim: Date;

  @Column('text', { nullable: true })
  descricao: string;

  @Column({ default: true })
  ativa: boolean;

  @ManyToMany(() => Aluno, aluno => aluno.turmas)
  alunos: Aluno[];

  @ManyToMany(() => Disciplina, disciplina => disciplina.turmas)
  @JoinTable({
    name: 'turma_disciplinas',
    joinColumn: { name: 'turma_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'disciplina_id', referencedColumnName: 'id_disciplina' }
  })
  disciplinas: Disciplina[];

  @OneToMany(() => Aviso, aviso => aviso.turma)
  avisos: Aviso[];

  @ManyToOne(() => Professor, professor => professor.turmas, { nullable: true })
  @JoinColumn({ name: 'professor_id' })
  professor?: Professor;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}