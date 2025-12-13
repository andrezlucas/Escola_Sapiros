import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
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
  @JoinColumn()
  aluno: Aluno;

  @OneToMany(() => Documento, documento => documento.documentacao, {
    cascade: true,
  })
  documentos: Documento[];

  @CreateDateColumn()
  criadoEm: Date;
}
