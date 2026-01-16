export type EntidadeIA =
  | 'aluno'
  | 'nota'
  | 'frequencia'
  | 'habilidade'
  | 'atividade'
  | 'simulado'
  | 'disciplina';

export type AcaoIA =
  | 'media_geral'
  | 'melhor_disciplina'
  | 'pior_disciplina'
  | 'buscar_por_data'
  | 'pendencias'
  | 'quantidade'
  | 'consultar';

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
