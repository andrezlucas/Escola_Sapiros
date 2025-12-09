import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Role {
  ALUNO = 'aluno',
  PROFESSOR = 'professor',
  COORDENACAO = 'coordenacao',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true })
  cpf: string;

  @Column()
  senha: string;

  @Column({
    type: 'timestamp',
    name: 'senha_expira_em',
    default: () => 'DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 180 DAY)',
  })
  senhaExpiraEm: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  senhaAtualizadaEm: Date;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @CreateDateColumn()
  UsuariocriadoEm: Date;

  @UpdateDateColumn()
  UsuarioatualizadoEm: Date;
}
