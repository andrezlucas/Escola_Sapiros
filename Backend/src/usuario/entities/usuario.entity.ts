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

  // CORRIGIDO: Usando @UpdateDateColumn e nome da coluna correto (snake_case)
  @UpdateDateColumn({ name: 'senha_atualizada_em' })
  senhaAtualizadaEm: Date;

  @Column({ type: 'enum', enum: Role })
  role: Role;
  
  // Coluna para controle de bloqueio de login (Pré-Matrícula)
  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;


  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}