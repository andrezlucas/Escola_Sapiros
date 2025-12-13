import {
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Turma } from '../../turma/entities/turma.entity';
import { Documentacao } from '../../documentacao/entities/documentacao.entity';

enum Sexo {
  MASCULINO = 'MASCULINO',
  FEMININO = 'FEMININO',
  OUTRO = 'OUTRO',
  NAO_INFORMADO = 'NAO_INFORMADO',
}

@Entity('alunos')
export class Aluno {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'id' })
  usuario: Usuario;

  @OneToOne(() => Documentacao, (documentacao) => documentacao.aluno, {
    cascade: true,
    eager: true,
  })
  documentacao?: Documentacao;

  @Column({ name: 'matricula_aluno', unique: true })
  matriculaAluno: string;

  @Column({ name: 'serie_ano' })
  serieAno: string;

  @Column({ name: 'escola_origem', nullable: true })
  escolaOrigem?: string;

  @Column({ unique: true, nullable: true })
  telefone: string;

  @Column({ name: 'data_nascimento', type: 'date' })
  dataNascimento: Date;

  @Column({
    type: 'enum',
    enum: ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'],
    default: 'NAO_INFORMADO',
    name: 'sexo',
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

  @Column({ name: 'responsavel_nome', nullable: true })
  responsavelNome?: string;

  @Column({ name: 'responsavel_data_nascimento', type: 'date', nullable: true })
  responsavelDataNascimento?: Date;

  @Column({
    type: 'enum',
    enum: ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'],
    default: 'NAO_INFORMADO',
    name: 'responsavel_sexo',
  })
  responsavelSexo?: string;

  @Column({ name: 'responsavel_nacionalidade', nullable: true })
  responsavelNacionalidade?: string;

  @Column({ name: 'responsavel_naturalidade', nullable: true })
  responsavelNaturalidade?: string;

  @Column({ name: 'responsavel_cpf', nullable: true })
  responsavelCpf?: string;

  @Column({ name: 'responsavel_rg', nullable: true })
  responsavelRg?: string;

  @Column({ name: 'responsavel_rg_orgao_emissor', nullable: true })
  responsavelRgOrgaoEmissor?: string;

  @Column({ name: 'responsavel_telefone', nullable: true })
  responsavelTelefone?: string;

  @Column({ name: 'responsavel_email', nullable: true })
  responsavelEmail?: string;

  @Column({ name: 'responsavel_cep', nullable: true })
  responsavelCep?: string;

  @Column({ name: 'responsavel_logradouro', nullable: true })
  responsavelLogradouro?: string;

  @Column({ name: 'responsavel_numero', nullable: true })
  responsavelNumero?: string;

  @Column({ name: 'responsavel_complemento', nullable: true })
  responsavelComplemento?: string;

  @Column({ name: 'responsavel_bairro', nullable: true })
  responsavelBairro?: string;

  @Column({ name: 'responsavel_cidade', nullable: true })
  responsavelCidade?: string;

  @Column({ name: 'responsavel_estado', length: 2, nullable: true })
  responsavelEstado?: string;

  @ManyToMany(() => Turma, (turma) => turma.alunos)
  @JoinTable({ name: 'alunos_turmas' })
  turmas?: Turma[];

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}