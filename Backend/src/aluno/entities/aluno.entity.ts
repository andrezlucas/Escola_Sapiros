import { Column, ManyToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, Entity, PrimaryColumn, OneToOne, JoinColumn, JoinTable, PrimaryGeneratedColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Turma } from '../../turma/entities/turma.entity';
import { Documentacao } from '../../documentacao/entities/documentacao.entity';
import { Sexo } from '../../usuario/entities/usuario.entity';
import { OneToMany } from 'typeorm';
import { Nota } from '../../nota/entities/nota.entity';
import { Frequencia } from '../../frequencia/entities/frequencia.entity';

@Entity('alunos')
export class Aluno {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @OneToOne(() => Documentacao, (documentacao) => documentacao.aluno, {
    cascade: true,
    eager: true,
  })
  documentacao?: Documentacao;

  @ManyToOne(() => Turma, (turma) => turma.alunos, {
    nullable: true,          // aluno pode existir sem turma
    onDelete: 'SET NULL',    // ao apagar a turma, o aluno não é deletado
    eager: true,
  })
  @JoinColumn({ name: 'turma_id' })
  turma?: Turma;



  @Column({ name: 'matricula_aluno', unique: true })
  matriculaAluno: string;

  @Column({ name: 'serie_ano' })
  serieAno: string;

  @Column({ name: 'escola_origem' })
  escolaOrigem: string;

  @Column({ name: 'rg_numero' })
  rgNumero: string;

  @Column({ name: 'rg_data_emissao', type: 'date' })
  rgDataEmissao: Date;

  @Column({ name: 'rg_orgao_emissor' })
  rgOrgaoEmissor: string;

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

  @Column({ name: 'autorizacao_saida_sozinho', default: false })
  autorizacaoSaidaSozinho: boolean;

  @Column({ name: 'autorizacao_uso_imagem', default: false })
  autorizacaoUsoImagem: boolean;

  // Dados do Responsável
  @Column({ name: 'responsavel_nome' })
  responsavelNome: string;

  @Column({ name: 'responsavel_data_nascimento', type: 'date' })
  responsavelDataNascimento: Date;

  @Column({
  name: 'responsavel_sexo',
  type: 'enum',
  enum: Sexo,
  default: Sexo.NAO_INFORMADO
})
responsavel_sexo: Sexo;

  @Column({ name: 'responsavel_nacionalidade' })
  responsavelNacionalidade: string;

  @Column({ name: 'responsavel_naturalidade' })
  responsavelNaturalidade: string;

  @Column({ name: 'responsavel_cpf' })
  responsavelCpf: string;

  @Column({ name: 'responsavel_rg' })
  responsavelRg: string;

  @Column({ name: 'responsavel_rg_orgao_emissor' })
  responsavelRgOrgaoEmissor: string;

  @Column({ name: 'responsavel_telefone' })
  responsavelTelefone: string;

  @Column({ name: 'responsavel_email' })
  responsavelEmail: string;

  @Column({ name: 'responsavel_cep' })
  responsavelCep: string;

  @Column({ name: 'responsavel_logradouro' })
  responsavelLogradouro: string;

  @Column({ name: 'responsavel_numero' })
  responsavelNumero: string;

  @Column({ name: 'responsavel_complemento', nullable: true })
  responsavelComplemento?: string;

  @Column({ name: 'responsavel_bairro' })
  responsavelBairro: string;

  @Column({ name: 'responsavel_cidade' })
  responsavelCidade: string;

  @Column({ name: 'responsavel_estado', length: 2 })
  responsavelEstado: string;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;

  @OneToMany(() => Nota, (nota) => nota.aluno)
  notas: Nota[];

  @OneToMany(() => Frequencia, (frequencia) => frequencia.aluno)
  frequencias: Frequencia[];
}