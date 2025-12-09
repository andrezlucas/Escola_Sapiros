import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { Turma } from '../../turma/entities/turma.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('professores')
export class Professor {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  usuario: Usuario;

  @Column({ name: 'registro_funcional', unique: true, nullable: true })
  registroFuncional?: string;

  @Column({ nullable: true })
  cargo?: string;

  @Column({ name: 'carga_horaria', type: 'float', default: 0 })
  cargaHoraria: number;

  @OneToMany(() => Turma, turma => turma.professor)
  turmas: Turma[];

  @CreateDateColumn()
  ProfessorcriadoEm: Date;

  @UpdateDateColumn()
  ProfessoratualizadoEm: Date;
}