import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Professor } from '../../professor/entities/professor.entity';
import { Aluno } from '../../aluno/entities/aluno.entity';

@Entity('turmas')
export class Turma {
  @PrimaryGeneratedColumn()
  id_turma: number;

  @Column()
  ano: number;

  @Column()
  serie: string;

  @ManyToOne(() => Professor, professor => professor.turmas)
  @JoinColumn({ name: 'id_professor' })
  professor: Professor;

  @OneToMany(() => Aluno, aluno => aluno.turma)
  alunos: Aluno[];
}
