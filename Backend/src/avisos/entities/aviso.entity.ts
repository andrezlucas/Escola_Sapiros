import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Turma } from '../../turma/entities/turma.entity';
import { Professor } from '../../professor/entities/professor.entity';

export enum TipoAviso {
  GERAL = 'GERAL',
  TURMA = 'TURMA',
  INDIVIDUAL = 'INDIVIDUAL',
  PROFESSOR = 'PROFESSOR',
}

export enum CategoriaAviso {
  ACADEMICO = 'ACADEMICO',
  SECRETARIA = 'SECRETARIA',
  EVENTO = 'EVENTO',
  URGENTE = 'URGENTE',
  FERIADO = 'FERIADO',
  TECNOLOGIA = 'TECNOLOGIA',
}

@Entity('avisos')
export class Aviso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column('text')
  descricao: string;

  @Column({
    type: 'enum',
    enum: TipoAviso,
    default: TipoAviso.GERAL,
  })
  tipo: TipoAviso;

  @Column({
    type: 'enum',
    enum: CategoriaAviso,
  })
  categoria: CategoriaAviso;

  @Column({ name: 'data_inicio', type: 'timestamp' })
  dataInicio: Date;

  @Column({ name: 'data_final', type: 'timestamp', nullable: true })
  dataFinal?: Date;

  @ManyToOne(() => Usuario, { nullable: false, eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToOne(() => Turma, { nullable: true, eager: true })
  @JoinColumn({ name: 'turma_id' })
  turma?: Turma | null;

  @Column({ name: 'destinatario_aluno_id', type: 'uuid', nullable: true })
  destinatarioAlunoId?: string | null;

  @Column({ name: 'destinatario_professor_id', type: 'uuid', nullable: true })
  destinatarioProfessorId?: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
