import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, ManyToOne, JoinColumn, } from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Aviso } from '../../avisos/entities/aviso.entity';
import { Professor } from '../../professor/entities/professor.entity';


@Entity('turmas')
export class Turma {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ name: 'nome_turma' })
  nome_turma: string;

  @Column({name: 'capacidade_maxima'})
  capacidade_maxima: number

  @Column({ name: 'ano_letivo' })
  anoLetivo: string;

  @Column()
  turno: string;

  @Column({ default: true })
  ativa: boolean;


  @CreateDateColumn({ name: 'turma_criado_em' })
  turmacriadoEm: Date;

  @UpdateDateColumn({ name: 'turma_atualizado_em' })
  turmaatualizadoEm: Date;
}