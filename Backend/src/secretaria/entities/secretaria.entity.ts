import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity('secretarias')
export class Secretaria {
  @PrimaryGeneratedColumn()
  id_secretaria: number;

  @Column()
  nome_funcionario_secretaria: string;

  @Column()
  email_funcionario_secretaria: string;

  @Column()
  data_admissao: Date;

  @Column()
  setor: string;

  @OneToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;
}
