import { ApiProperty } from '@nestjs/swagger';

export class TurmaGraficoAlunosDto {
  @ApiProperty({
    example: 'b3b9c1a2-9c3a-4bfa-8d61-1a2f9f5d7e21',
    description: 'ID da turma',
  })
  turmaId: string;

  @ApiProperty({
    example: 'Classe 1',
    description: 'Nome da turma',
  })
  nomeTurma: string;

  @ApiProperty({
    example: 225,
    description: 'Quantidade total de alunos matriculados',
  })
  totalAlunos: number;

  @ApiProperty({
    example: 300,
    nullable: true,
    description: 'Capacidade máxima da turma',
  })
  capacidadeMaxima: number | null;
}
