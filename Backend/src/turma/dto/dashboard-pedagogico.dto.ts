import { ApiProperty } from '@nestjs/swagger';

export class DashboardResumoDto {
  @ApiProperty({ example: 7.8 })
  mediaGeral: number;

  @ApiProperty({ example: 'up', enum: ['up', 'down', 'neutral'] })
  tendencia: 'up' | 'down' | 'neutral';

  @ApiProperty({ example: { nome: 'Lógica', percentual: 85 } })
  melhorCompetencia: {
    nome: string;
    percentual: number;
  };

  @ApiProperty({ example: 3 })
  alunosEmRisco: number;
}

export class DashboardEvolucaoDto {
  @ApiProperty({ example: 'Semana 1' })
  semana: string;

  @ApiProperty({ example: 7.5 })
  media: number;
}

export class DashboardAlunoDto {
  @ApiProperty({ example: 'uuid-do-aluno' })
  id: string;

  @ApiProperty({ example: 'Felipe de Melo' })
  nome: string;

  @ApiProperty({ example: 'EL40015' })
  matricula: string;

  @ApiProperty({ example: 4.6 })
  desempenhoGeral: number;

  @ApiProperty({ example: 'ATENCAO', enum: ['BOM', 'REGULAR', 'ATENCAO'] })
  status: 'BOM' | 'REGULAR' | 'ATENCAO';
}

export class DashboardHabilidadeDto {
  @ApiProperty({ example: 'Interpretação de Texto' })
  habilidade: string;

  @ApiProperty({ example: 82 })
  media: number;

  @ApiProperty({ example: 'BOM', enum: ['BOM', 'ATENCAO', 'CRITICO'] })
  status: 'BOM' | 'ATENCAO' | 'CRITICO';
}

export class HabilidadeDestaqueDto {
  @ApiProperty({ example: 'Interpretação de Gráficos' })
  habilidade: string;

  @ApiProperty({ example: 38, description: 'Média geral desta habilidade em todas as turmas' })
  media: number;

  @ApiProperty({ example: 'CRITICO', enum: ['CRITICO', 'ATENCAO'] })
  status: 'CRITICO' | 'ATENCAO';
}

export class DashboardProximaAtividadeDto {
  @ApiProperty({ example: 'uuid-atividade' })
  id: string;

  @ApiProperty({ example: 'Entrega trabalho de Física' })
  titulo: string;

  @ApiProperty({ example: 'Turma 2º ano B' })
  turma: string;

  @ApiProperty({ example: '2024-10-31T23:59:00Z' })
  dataEntrega: Date;
  
  @ApiProperty({ example: 31, description: 'Dia do mês para exibição no ícone' })
  dia: number;
}