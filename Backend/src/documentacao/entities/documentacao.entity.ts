import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Documento } from './documento.entity';

@Entity('documentacoes')
export class Documentacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Aluno, aluno => aluno.documentacao, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  @OneToMany(() => Documento, documento => documento.documentacao, {
    cascade: true,
  })
  documentos: Documento[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}