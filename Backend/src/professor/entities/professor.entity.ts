import {
  Entity,
  Column,
  PrimaryColumn,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Usuario } from '../../usuario/entities/usuario.entity';
import { Turma } from '../../turma/entities/turma.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';

@Entity('professores')
export class Professor {

  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, {
    cascade: false,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id' })
  usuario: Usuario;

  @ManyToMany(() => Disciplina, (disciplina) => disciplina.professores)
  disciplinas: Disciplina[];

  @OneToMany(() => Turma, (turma) => turma.professor)
  turmas: Turma[];


  @Column({ name: 'curso_graduacao', length: 100 })
  graduacao: string;

  @Column({ name: 'instituicao', length: 100 })
  instituicao: string;

  @Column({ name: 'data_inicio_graduacao', type: 'date' })
  dataInicioGraduacao: Date;

  @Column({
    name: 'data_conclusao_graduacao',
    type: 'date',
    nullable: true,
  })
  dataConclusaoGraduacao?: Date;

  @Column({ name: 'curso_segunda_graduacao', length: 100, nullable: true })
  segundagraduacao?: string;

  @Column({ name: 'instituicao_segunda_graduacao', length: 100, nullable: true })
  instituicaoSegundagraduacao?: string;

  @Column({ name: 'data_inicio_segunda_graduacao', type: 'date', nullable: true })
  dataInicioSegundagraduacao?: Date;

  @Column({ name: 'data_conclusao_segunda_graduacao', type: 'date', nullable: true })
  dataConclusaoSegundagraduacao?: Date;


  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
