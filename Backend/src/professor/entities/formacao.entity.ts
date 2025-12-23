import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Professor } from '../../professor/entities/professor.entity';

@Entity('formacoes')
export class Formacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  curso: string;

  @Column({ length: 100 })
  instituicao: string;

  @Column({ type: 'date' }) 
  dataInicio: Date;

  @Column({ type: 'date', nullable: true })
  dataConclusao?: Date;

  @ManyToOne(() => Professor, (professor) => professor.formacoes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'professorId' }) // Mapeia para a coluna professorId do banco
  professor: Professor;

  @CreateDateColumn() 
  criadoEm: Date;

  @UpdateDateColumn() 
  atualizadoEm: Date;
}

