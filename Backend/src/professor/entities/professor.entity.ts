import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryColumn, OneToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { Turma } from '../../turma/entities/turma.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';

@Entity('professores')
export class Professor {
  @PrimaryColumn('uuid')
  id: string;

  
  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  usuario: Usuario;

  @ManyToMany(() => Disciplina, disciplina => disciplina.professores)
  disciplinas: Disciplina[];

  @OneToMany(() => Turma, turma => turma.professor)
  turmas: Turma[];


  @Column({ name: 'curso_graduacao', length: 100 })
  graduacao: string;

  @Column({ name: 'instituicao', length: 100 })
  instituicao: string;

  @Column({ name: 'data_inicio_graduacao', type: 'date' })
  dataInicioGraduacao: Date;

  @Column({ name: 'data_conclusao_graduacao', type: 'date', nullable: true })
  dataConclusaoGraduacao?: Date;  // Pode ser nulo se ainda estiver cursando


  @CreateDateColumn()
  ProfessorcriadoEm: Date;

  @UpdateDateColumn()
  ProfessoratualizadoEm: Date;
}