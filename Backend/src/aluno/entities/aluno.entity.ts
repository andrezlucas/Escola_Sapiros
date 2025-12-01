import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Turma } from '../../turma/entities/turma.entity';

@Entity('alunos')
export class Aluno {
  @PrimaryColumn({ name: 'matricula_aluno' })
  matricula_aluno: string;

  // Informações Acadêmicas
  @Column({ name: 'serie_ano' })
  serieAno: string;

  @Column({ name: 'escola_origem', nullable: true })
  escolaOrigem: string;

  // Dados do Responsável
  @Column({ name: 'responsavel_nome', nullable: true })
  responsavelNome?: string;

  @Column({ name: 'responsavel_data_nascimento', type: 'date', nullable: true })
  responsavel_Data_Nascimento?: Date;


  @Column({ type: 'enum', enum: ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'], default: 'NAO_INFORMADO' })
  responsavel_sexo: string;

  @Column({ nullable: true })
  responsavel_nacionalidade: string;

  @Column({ nullable: true })
  responsavel_naturalidade: string;

   // Documentos do Responsável

  @Column({ name: 'responsavel_cpf', nullable: true })
  responsavelCpf?: string;

  @Column({ name: 'responsavel_rg', nullable: true })
  responsavelRg?: string;

  @Column({nullable: true })
  responsavel_rg_OrgaoEmissor: string;


  @Column({ name: 'responsavel_telefone', nullable: true })
  responsavelTelefone?: string;

  @Column({ name: 'responsavel_email', nullable: true })
  responsavelEmail?: string;


  // Endereço do Responsável

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

  

  // Relacionamentos
  @OneToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @ManyToMany(() => Turma, turma => turma.alunos)
@JoinTable({
  name: 'turma_alunos',
  joinColumn: {
    name: 'aluno_id',
    referencedColumnName: 'matricula_aluno'
  },
  inverseJoinColumn: {
    name: 'turma_id',
    referencedColumnName: 'id_turma' 
  }
})
turmas: Turma[];


   // Preenche automático as tabelas com a criação e atualização do ultimo registro para maior controle.
  @CreateDateColumn()
  AlunocriadoEm: Date;

  @UpdateDateColumn()
  AlunoatualizadoEm: Date;
}