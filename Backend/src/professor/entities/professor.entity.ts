import {
  Entity,
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
import { Formacao as FormacaoProfessor } from '../../professor/entities/formacao.entity';

@Entity('professores')
export class Professor {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  usuario: Usuario;

  @ManyToMany(() => Disciplina, (disciplina) => disciplina.professores)
  disciplinas: Disciplina[];

  @OneToMany(() => Turma, (turma) => turma.professor)
  turmas: Turma[];

  @OneToMany(() => FormacaoProfessor, (formacao) => formacao.professor, {
    cascade: true,
    eager: true,
  })
  formacoes: FormacaoProfessor[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
