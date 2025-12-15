import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, 
  OneToMany, ManyToMany, JoinTable, ManyToOne, JoinColumn 
} from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Aviso } from '../../avisos/entities/aviso.entity';
import { Professor } from '../../professor/entities/professor.entity';

@Entity('turmas')
export class Turma {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => Aluno, aluno => aluno.turmas)
  @JoinTable({
    name: 'alunos_turmas',
    joinColumn: { name: 'turma_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'aluno_id', referencedColumnName: 'id' },
  })
  alunos: Aluno[];

  @ManyToMany(() => Disciplina, disciplina => disciplina.turmas)
  @JoinTable({
    name: 'turma_disciplinas',
    joinColumn: { name: 'turma_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'disciplina_id', referencedColumnName: 'id_disciplina' },
  })
  disciplinas: Disciplina[];

  @OneToMany(() => Aviso, aviso => aviso.turma)
  avisos: Aviso[];

  @ManyToOne(() => Professor, professor => professor.turmas, { nullable: true })
  @JoinColumn({ name: 'professor_id' })
  professor?: Professor;

  @Column({ name: 'nome_turma' })
  nome_turma: string;

  @Column({ name: 'capacidade_maxima' })
  capacidade_maxima: number;

  @Column({ name: 'ano_letivo' })
  ano_letivo: string;

  @Column({ name: 'turno' })
  turno: string;

  // Define data_inicio com valor padrão CURRENT_DATE
  @Column({ type: 'date', name: 'data_inicio', default: () => 'CURRENT_DATE' })
  data_inicio: Date;

  // data_fim opcional
  @Column({ type: 'date', name: 'data_fim', nullable: true })
  data_fim?: Date;

  @Column({ default: true })
  ativa: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizado_em: Date;
}
