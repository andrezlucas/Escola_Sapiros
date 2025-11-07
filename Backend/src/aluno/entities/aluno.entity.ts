import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Turma } from '../../turma/entities/turma.entity';
import { Responsavel } from '../../responsavel/entities/responsavel.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('alunos')
export class Aluno {
  @PrimaryGeneratedColumn()
  matricula_aluno: number; 

  @Column()
  nome_aluno: string;

  @Column()
  data_nascimento: Date;

  @ManyToOne(() => Turma, turma => turma.alunos)
  @JoinColumn({ name: 'id_turma' })
  turma: Turma;

  @ManyToOne(() => Responsavel, responsavel => responsavel.alunos)
  @JoinColumn({ name: 'id_responsavel' })
  responsavel: Responsavel;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
