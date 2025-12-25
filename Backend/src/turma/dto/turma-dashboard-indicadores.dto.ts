import { ApiProperty } from '@nestjs/swagger';

export class TurmaDashboardIndicadoresDto {
  @ApiProperty({
    example: 65.3,
    description: 'Taxa geral de ocupação das turmas ativas (%)',
  })
  taxaOcupacaoGeral: number;

  @ApiProperty({
    example: 7,
    description: 'Quantidade total de turmas ativas',
  })
  totalTurmasAtivas: number;

  @ApiProperty({
    example: 1243,
    description: 'Quantidade total de alunos nas turmas ativas',
  })
  totalAlunos: number;
}
