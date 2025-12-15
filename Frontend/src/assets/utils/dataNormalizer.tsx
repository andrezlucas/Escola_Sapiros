export interface ProfessorNormalized {
  id: string;
  nome: string;
  usuario: {
    nome: string;
  };
}

export interface AlunoNormalized {
  id: string;
  nome: string;
  usuario: { nome: string };
}

export function normalizeProfessor(professor: any): ProfessorNormalized {
  if (professor.usuario && professor.usuario.nome) {
    return {
      id: professor.id,
      nome: professor.usuario.nome,
      usuario: { nome: professor.usuario.nome },
    };
  }

  if (professor.nome) {
    return {
      id: professor.id,
      nome: professor.nome,
      usuario: { nome: professor.nome },
    };
  }

  return {
    id: professor.id,
    nome: professor.usuario?.nome || professor.nome || "Sem nome",
    usuario: {
      nome: professor.usuario?.nome || professor.nome || "Sem nome",
    },
  };
}

export function normalizeAluno(aluno: any): AlunoNormalized {
  if (aluno.usuario && aluno.usuario.nome) {
    return {
      id: aluno.id,
      nome: aluno.usuario.nome,
      usuario: { nome: aluno.usuario.nome },
    };
  }

  if (aluno.nome) {
    return {
      id: aluno.id,
      nome: aluno.nome,
      usuario: { nome: aluno.nome },
    };
  }

  return {
    id: aluno.id,
    nome: aluno.usuario?.nome || aluno.nome || "Sem nome",
    usuario: {
      nome: aluno.usuario?.nome || aluno.nome || "Sem nome",
    },
  };
}
