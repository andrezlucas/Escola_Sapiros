export type EntidadeIA =
  | 'aluno'
  | 'nota'
  | 'frequencia'
  | 'habilidade'
  | 'atividade'
  | 'simulado'
  | 'disciplina';

export type AcaoIA =
  | 'media'
  | 'maior_facilidade'
  | 'menor_desempenho'
  | 'buscar_por_data'
  | 'buscar_por_periodo'
  | 'pendencias'
  | 'quantidade'
  | 'consultar'; // 🔥 ação genérica padrão

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
