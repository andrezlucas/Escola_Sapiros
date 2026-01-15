import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

export enum TipoDocumentoEnum {
  ATESTADO_MATRICULA = 'atestado_matricula',
  HISTORICO_ESCOLAR = 'historico_escolar',
  DECLARACAO_VINCULO_SERVIDOR = 'declaracao_vinculo_servidor',
  ATESTADO_VAGA = 'atestado_vaga',
  DECLARACAO_MATRICULA = 'declaracao_matricula',
  DECLARACAO_FREQUENCIA = 'declaracao_frequencia',  
  DECLARACAO_CONCLUSAO = 'declaracao_conclusao',
  BOLETIM = 'boletim',
}

export enum StatusSolicitacaoEnum {
  PENDENTE = 'pendente',
  CONCLUIDO = 'concluido',
  EM_ANDAMENTO = 'em_andamento',
  APROVADO = 'aprovado',
  REJEITADO = 'rejeitado',
}

export enum FormaEntregaEnum {
  PRESENCIAL = 'presencial',
  EMAIL = 'email',
  CORREIOS = 'correios',
}

@Entity('solicitacoes_documentos')
export class SolicitacaoDocumento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  protocolo: string;

  @ManyToOne(() => Aluno, { eager: true })
  aluno: Aluno;

  @Column({
    type: 'enum',
    enum: TipoDocumentoEnum,
  })
  tipoDocumento: TipoDocumentoEnum;

  @Column({
    type: 'enum',
    enum: StatusSolicitacaoEnum,
    default: StatusSolicitacaoEnum.PENDENTE,
  })
  status: StatusSolicitacaoEnum;

  @Column({
    type: 'enum',
    enum: FormaEntregaEnum,
  })
  formaEntrega: FormaEntregaEnum;

  @Column({ nullable: true })
  motivo: string;

  @Column({ nullable: true })
  arquivoUrl: string; // PDF final

  @CreateDateColumn()
  criadoEm: Date;

  @UpdateDateColumn()
  atualizadoEm: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  atendidoPor: Usuario; // secretaria
}
