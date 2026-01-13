import { Column, CreateDateColumn, UpdateDateColumn, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { FuncaoCoordenacao } from '../enums/funcao-coordenacao.enum';

@Entity('coordenacao')
export class Coordenacao {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  usuario: Usuario;

  @Column({
    type: 'enum',
    enum: FuncaoCoordenacao,
  })
  funcao: FuncaoCoordenacao;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}













