import {
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Turma } from '../../turma/entities/turma.entity';
import { Documentacao } from '../../documentacao/entities/documentacao.entity';

@Entity('alunos')
export class Aluno {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  usuario: Usuario;

  @OneToOne(() => Documentacao, (documentacao) => documentacao.aluno, {
    cascade: true,
    eager: true,
  })
  documentacao?: Documentacao;

  @Column({ name: 'matricula_aluno', unique: true })
  matricula_aluno: string;

  @Column()
  serieAno: string;

  @Column({ nullable: true })
  escolaOrigem?: string;

  // Dados Pessoais do Aluno (Removidos de Usuario e adicionados aqui)
  @Column({ unique: true, nullable: true })
  telefone: string;

  @Column({ type: 'date' })
  data_nascimento: Date;

  @Column({
    type: 'enum',
    enum: ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'],
    default: 'NAO_INFORMADO',
  })
  sexo: string;

  @Column({ name: 'rg_numero' })
  rgNumero: string;

  @Column({ name: 'rg_data_emissao', type: 'date', nullable: true })
  rgDataEmissao?: Date;

  @Column({ name: 'rg_orgao_emissor', nullable: true })
  rgOrgaoEmissor?: string;

  @Column({ name: 'endereco_logradouro' })
  enderecoLogradouro: string;

  @Column({ name: 'endereco_numero' })
  enderecoNumero: string;

  @Column({ name: 'endereco_cep' })
  enderecoCep: string;

  @Column({ name: 'endereco_complemento', nullable: true })
  enderecoComplemento?: string;

  @Column({ name: 'endereco_bairro' })
  enderecoBairro: string;

  @Column({ name: 'endereco_estado', length: 2 })
  enderecoEstado: string;

  @Column({ name: 'endereco_cidade' })
  enderecoCidade: string;

  @Column()
  nacionalidade: string;

  @Column()
  naturalidade: string;

  @Column({ name: 'possui_necessidades_especiais', default: false })
  possuiNecessidadesEspeciais: boolean;

  @Column({ name: 'descricao_necessidades_especiais', nullable: true })
  descricaoNecessidadesEspeciais?: string;

  @Column({ name: 'possui_alergias', default: false })
  possuiAlergias: boolean;

  @Column({ name: 'descricao_alergias', nullable: true })
  descricaoAlergias?: string;

  @Column({ name: 'autorizacao_uso_imagem', default: false })
  autorizacaoUsoImagem: boolean;
  // Fim dos Dados Pessoais

  // Dados do Responsável
  @Column({ nullable: true })
  responsavelNome?: string;

  @Column({ type: 'date', nullable: true })
  responsavel_Data_Nascimento?: Date;

  @Column({
    type: 'enum',
    enum: ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'],
    default: 'NAO_INFORMADO',
  })
  responsavel_sexo?: string;

  @Column({ nullable: true })
  responsavel_nacionalidade?: string;

  @Column({ nullable: true })
  responsavel_naturalidade?: string;

  @Column({ nullable: true })
  responsavelCpf?: string;

  @Column({ nullable: true })
  responsavelRg?: string;

  @Column({ nullable: true })
  responsavel_rg_OrgaoEmissor?: string;

  @Column({ nullable: true })
  responsavelTelefone?: string;

  @Column({ nullable: true })
  responsavelEmail?: string;

  @Column({ nullable: true })
  responsavelCep?: string;

  @Column({ nullable: true })
  responsavelLogradouro?: string;

  @Column({ nullable: true })
  responsavelNumero?: string;

  @Column({ nullable: true })
  responsavelComplemento?: string;

  @Column({ nullable: true })
  responsavelBairro?: string;

  @Column({ nullable: true })
  responsavelCidade?: string;

  @Column({ length: 2, nullable: true })
  responsavelEstado?: string;
  // Fim dos Dados do Responsável

  @ManyToMany(() => Turma, (turma) => turma.alunos)
  turmas?: Turma[];

  @CreateDateColumn()
  AlunocriadoEm: Date;

  @UpdateDateColumn()
  AlunoatualizadoEm: Date;
}
