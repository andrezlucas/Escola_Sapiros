import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';

@Entity('habilidades')
export class Habilidade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Disciplina, disciplina => disciplina.habilidades, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;

  @Column({ length: 100 })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao?: string;

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;
}
