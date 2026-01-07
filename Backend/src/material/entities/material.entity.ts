import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Turma } from '../../turma/entities/turma.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Professor } from '../../professor/entities/professor.entity';
import { TipoMaterial } from '../enums/tipo-material.enum';
import { OrigemMaterial } from '../enums/origem-material.enum';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @Column({
    type: 'enum',
    enum: TipoMaterial,
  })
  tipo: TipoMaterial;

  @Column({
    type: 'enum',
    enum: OrigemMaterial,
  })
  origem: OrigemMaterial;

  @Column({ type: 'text', nullable: true })
  url?: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500, nullable: true })
  filePath?: string;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType?: string;

  @Column({ type: 'int', nullable: true })
  tamanho?: number;

  @ManyToOne(() => Turma, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'turma_id' })
  turma?: Turma;

  @ManyToOne(() => Disciplina, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina?: Disciplina;

  @ManyToOne(() => Professor, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'professor_id' })
  professor: Professor;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}
