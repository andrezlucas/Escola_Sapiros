import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Frequencia } from '../../frequencia/entities/frequencia.entity';
import { Nota } from '../../nota/entities/nota.entity';
import { Turma } from '../../turma/entities/turma.entity';
import { Professor } from '../../professor/entities/professor.entity';
import { Habilidade } from '../../disciplina/entities/habilidade.entity';
import { Atividade } from '../../atividade/entities/atividade.entity';

@Entity('disciplinas')
export class Disciplina {
  @PrimaryGeneratedColumn('uuid')
  id_disciplina: string;

  @OneToMany(() => Frequencia, frequencia => frequencia.disciplina)
  frequencias: Frequencia[];

  @OneToMany(() => Nota, nota => nota.disciplina)
  notas: Nota[];


  @ManyToMany(() => Turma, turma => turma.disciplinas)
  turmas: Turma[];

  @ManyToMany(() => Professor, professor => professor.disciplinas)
  @JoinTable({
    name: 'professores_disciplinas',
    joinColumn: { name: 'disciplina_id', referencedColumnName: 'id_disciplina' },
    inverseJoinColumn: { name: 'professor_id' },
  })
  professores: Professor[];

  @OneToMany(() => Habilidade, habilidade => habilidade.disciplina, {
    cascade: true,
  })
  habilidades: Habilidade[];

  @OneToMany(() => Atividade, atividade => atividade.disciplina)
  atividades: Atividade[];

  @Column({ unique: true, length: 20 })
  codigo_disciplina: string;

  @Column({ length: 30 })
  nome_disciplina: string;

  @Column('int')
  cargaHoraria: number;

  @CreateDateColumn()
  disciplinacriadoEm: Date;

  @UpdateDateColumn()
  disciplinaatualizadoEm: Date;
}
