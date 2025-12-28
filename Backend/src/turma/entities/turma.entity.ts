import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
} from 'typeorm';

import { Aluno } from '../../aluno/entities/aluno.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Aviso } from '../../avisos/entities/aviso.entity';
import { Professor } from '../../professor/entities/professor.entity';
import { Atividade } from '../../atividade/entities/atividade.entity';

@Entity('turmas')
export class Turma {
  @PrimaryGeneratedColumn('uuid')
  id: string;


  @ManyToMany(() => Atividade, atividade => atividade.turmas)
  atividades: Atividade[];

  // 🔗 Aluno pertence a UMA turma
  @OneToMany(() => Aluno, aluno => aluno.turma)
  alunos: Aluno[];

  // 📚 Turma pode ter várias disciplinas
  @ManyToMany(() => Disciplina, disciplina => disciplina.turmas)
  @JoinTable({
    name: 'turma_disciplinas',
    joinColumn: { name: 'turma_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'disciplina_id',
      referencedColumnName: 'id_disciplina',
    },
  })
  disciplinas: Disciplina[];

  // 📢 Avisos da turma
  @OneToMany(() => Aviso, aviso => aviso.turma)
  avisos: Aviso[];

  // 👨‍🏫 Professor responsável (opcional)
  @ManyToOne(() => Professor, professor => professor.turmas, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'professor_id' })
  professor?: Professor;

  @Column({ name: 'nome_turma' })
  nome_turma: string;

  @Column({ name: 'capacidade_maxima' })
  capacidade_maxima: number;

  @Column({ name: 'ano_letivo' })
  ano_letivo: string;

  @Column()
  turno: string;

  @Column({ default: true })
  ativa: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criado_em: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizado_em: Date;
}
