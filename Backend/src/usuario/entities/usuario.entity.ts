import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, } from 'typeorm';

export enum Role {
  ALUNO = 'aluno',
  PROFESSOR = 'professor',
  COORDENACAO = 'coordenacao',
}

export enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  OUTRO = 'OUTRO',
  NAO_INFORMADO = 'NAO_INFORMADO',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ name: 'data_nascimento', type: 'date' })
  dataNascimento: Date;

  @Column({ unique: true })
  telefone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  senha: string;

  @Column({ name: 'endereco_logradouro' })
  enderecoLogradouro: string;

  @Column({ name: 'endereco_numero' })
  enderecoNumero: string;

  @Column({ name: 'endereco_cep', length: 8 })
  enderecoCep: string;

  @Column({ name: 'endereco_complemento', nullable: true })
  enderecoComplemento?: string;

  @Column({ name: 'endereco_bairro' })
  enderecoBairro: string;

  @Column({ name: 'endereco_estado', length: 2 })
  enderecoEstado: string;

  @Column({ name: 'endereco_cidade' })
  enderecoCidade: string;


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

  @Column({
    type: 'enum',
    enum: Sexo,
    default: 'NAO_INFORMADO',
    name: 'sexo',
  })
  sexo: Sexo;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;


  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}