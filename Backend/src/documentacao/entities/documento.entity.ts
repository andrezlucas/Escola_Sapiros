import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Documentacao } from '../../documentacao/entities/documentacao.entity';
import { TipoDocumento } from '../enums/tipo-documento.enum';

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TipoDocumento,
  })
  tipo: TipoDocumento;

  @Column({ name: 'nome_original' })
  nomeOriginal: string;

  @Column({ name: 'nome_arquivo' })
  nomeArquivo: string;

  @Column()
  caminho: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column()
  tamanho: number;

  @ManyToOne(() => Documentacao, d => d.documentos, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'documentacao_id' })
  documentacao: Documentacao;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;
}