import { ApiProperty } from '@nestjs/swagger';
import { TurmaGraficoAlunosDto } from './turma-grafico-alunos.dto';
import { TurmaDashboardIndicadoresDto } from './turma-dashboard-indicadores.dto';

export class TurmaDashboardDto {
  @ApiProperty({
    type: [TurmaGraficoAlunosDto],
    description: 'Dados do gráfico de alunos por turma',
  })
  graficoAlunosPorTurma: TurmaGraficoAlunosDto[];

  @ApiProperty({
    type: TurmaDashboardIndicadoresDto,
    description: 'Indicadores gerais do dashboard',
  })
  indicadores: TurmaDashboardIndicadoresDto;
}
