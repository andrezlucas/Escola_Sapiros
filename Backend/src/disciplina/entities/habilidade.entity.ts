import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Disciplina } from './disciplina.entity';

@Entity('habilidades')
export class Habilidade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 80 })
  nome: string;

  @Column({ length: 255, nullable: true })
  descricao?: string;

  @Column({ default: 1 })
  nivel: number; // opcional: 1-5, etc.

  @ManyToOne(() => Disciplina, disciplina => disciplina.habilidades, { onDelete: 'CASCADE' })
  disciplina: Disciplina;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}