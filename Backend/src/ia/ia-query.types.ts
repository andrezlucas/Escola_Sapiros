export type EntidadeIA =
  | 'aluno'
  | 'nota'
  | 'frequencia'
  | 'habilidade'
  | 'atividade'
  | 'simulado'
  | 'disciplina'
  | 'ia';

export type AcaoIA =
  | 'media_geral'
  | 'melhor_disciplina'
  | 'pior_disciplina'
  | 'ranking'
  | 'buscar_por_data'
  | 'pendencias'
  | 'quantidade'
  | 'consultar'
  | 'score'
  | 'disciplinas_criticas'
  | 'sugestao_reforco'
  | 'evolucao';

export interface IntentIA {
  entidade: EntidadeIA;
  acao: AcaoIA;
  filtros: {
    alunoId?: string;
    nomeAluno?: string;
    data?: string;
    inicio?: string;
    fim?: string;
    disciplina?: string;
  };
}
