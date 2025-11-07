import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('responsaveis')
export class Responsavel {
  @PrimaryGeneratedColumn()
  id_responsavel: number;

  @Column({ unique: true })
  cpf_responsavel: string;

  @Column()
  nome_responsavel: string;

  @Column()
  telefone_responsavel: string;

  @Column()
  email_responsavel: string;

  @Column()
  grau_parentesco: string;

  @OneToMany(() => Aluno, aluno => aluno.responsavel)
  alunos: Aluno[];

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
