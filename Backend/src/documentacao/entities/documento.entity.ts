import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
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

  @Column()
  nomeOriginal: string;

  @Column()
  nomeArquivo: string;

  @Column()
  caminho: string;

  @Column()
  mimeType: string;

  @Column()
  tamanho: number;

  @ManyToOne(() => Documentacao, d => d.documentos, {
    onDelete: 'CASCADE',
  })
  documentacao: Documentacao;

  @CreateDateColumn()
  criadoEm: Date;
}
