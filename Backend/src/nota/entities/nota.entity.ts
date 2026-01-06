import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Professor } from '../../professor/entities/professor.entity';
import { Bimestre } from '../../shared/enums/bimestre.enum';

export enum NotaStatus {
  SALVO = 'SALVO',
  PENDENTE = 'PENDENTE'
}

@Entity('notas')
export class Nota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0, name: 'nota_1' })
  nota1: number;

  @Column({ type: 'json', nullable: true, name: 'habilidades_1' })
  habilidades1: string[];

  @Column({ type: 'text', nullable: true, name: 'feedback_1' })
  feedback1: string;

  @Column('decimal', { precision: 5, scale: 2, default: 0, name: 'nota_2' })
  nota2: number;

  @Column({ type: 'json', nullable: true, name: 'habilidades_2' })
  habilidades2: string[];

  @Column({ type: 'text', nullable: true, name: 'feedback_2' })
  feedback2: string;

  @Column({
    type: 'enum',
    enum: Bimestre,
    name: 'bimestre'
  })
  bimestre: Bimestre;

  @Column({
    type: 'enum',
    enum: NotaStatus,
    default: NotaStatus.PENDENTE
  })
  status: NotaStatus;

  @ManyToOne(() => Aluno, (aluno) => aluno.notas, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @ManyToOne(() => Disciplina, (disciplina) => disciplina.notas, { nullable: false })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;

  @ManyToOne(() => Professor, { nullable: false })
  @JoinColumn({ name: 'professor_id' })
  professor: Professor;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}