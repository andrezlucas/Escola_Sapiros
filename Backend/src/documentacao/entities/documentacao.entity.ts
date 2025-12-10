import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';

@Entity('documentacoes')
export class Documentacao {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ nullable: true })
  rgNumero?: string;

  @Column({ nullable: true })
  certidaoNumero?: string;

  @Column({ nullable: true })
  observacoes?: string;

  @OneToOne(() => Aluno, (aluno) => aluno.documentacao, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @Column({ name: 'aluno_id', type: 'uuid', unique: true })
  alunoId: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
