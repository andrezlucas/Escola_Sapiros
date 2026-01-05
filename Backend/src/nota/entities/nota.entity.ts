import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { Aluno } from '../../aluno/entities/aluno.entity';
import { Disciplina } from '../../disciplina/entities/disciplina.entity';
import { Professor } from '../../professor/entities/professor.entity';

// Conforme sua solicitação: Avaliações fixas por bimestre
export enum Bimestre {
  PRIMEIRO = '1º Bimestre',
  SEGUNDO = '2º Bimestre',
  TERCEIRO = '3º Bimestre',
  QUARTO = '4º Bimestre'
}

export enum NotaStatus {
  SALVO = 'SALVO',
  PENDENTE = 'PENDENTE'
}

@Entity('notas')
export class Nota {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nota 1 conforme o input da imagem
  @Column('decimal', { precision: 5, scale: 2, default: 0, name: 'nota_1' })
  nota1: number;

  // Nota 2 conforme o input da imagem
  @Column('decimal', { precision: 5, scale: 2, default: 0, name: 'nota_2' })
  nota2: number;

  @Column({
    type: 'enum',
    enum: Bimestre,
    name: 'bimestre'
  })
  bimestre: Bimestre;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  // Armazena as habilidades selecionadas (ex: ["Habilidade 1", "Habilidade 2"])
  @Column({ type: 'json', nullable: true })
  habilidades: string[];

  @Column({
    type: 'enum',
    enum: NotaStatus,
    default: NotaStatus.PENDENTE
  })
  status: NotaStatus;

  // RELAÇÕES CHAVE

  // Nota pertence a um Aluno (ajustado para bater com a propriedade 'notas' que você adicionou em Aluno)
  @ManyToOne(() => Aluno, (aluno) => aluno.notas, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'aluno_id' })
  aluno: Aluno;

  // Nota pertence a uma Disciplina
  @ManyToOne(() => Disciplina, (disciplina) => disciplina.notas, { nullable: false })
  @JoinColumn({ name: 'disciplina_id' })
  disciplina: Disciplina;

  // Nota é lançada por um Professor (necessário para o filtro de segurança)
  @ManyToOne(() => Professor, { nullable: false })
  @JoinColumn({ name: 'professor_id' })
  professor: Professor;

  @CreateDateColumn({ name: 'criado_em' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  atualizadoEm: Date;
}