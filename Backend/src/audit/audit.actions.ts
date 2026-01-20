export const AUDIT_ACTIONS = {
  // Coordenacao
  CREATE_AVISO: 'Criou um aviso',
  UPDATE_AVISO: 'Editou um aviso',
  DELETE_AVISO: 'Excluiu um aviso',
  CREATE_TURMA: 'Criou uma turma',
  UPDATE_TURMA: 'Editou uma turma',
  DELETE_TURMA: 'Excluiu uma turma',
  CREATE_DISCIPLINA: 'Criou uma disciplina',
  UPDATE_DISCIPLINA: 'Editou uma disciplina',
  DELETE_DISCIPLINA: 'Excluiu uma disciplina',
  TOGGLE_USUARIO_STATUS: 'Alterou status de usuário',
  RESET_SENHA: 'Redefiniu senha de usuário',

  // Professor
  UPLOAD_MATERIAL: 'Enviou um material',
  UPDATE_MATERIAL: 'Atualizou um material',
  DELETE_MATERIAL: 'Excluiu um material',
  CREATE_ATIVIDADE: 'Criou uma atividade',
  UPDATE_ATIVIDADE: 'Editou uma atividade',
  DELETE_ATIVIDADE: 'Excluiu uma atividade',
  CREATE_SIMULADO: 'Criou um simulado',
  UPDATE_SIMULADO: 'Editou um simulado',
  DELETE_SIMULADO: 'Excluiu um simulado',
  LANCAR_NOTA: 'Lançou uma nota',
  LANCAR_FREQUENCIA: 'Lançou uma frequência',

  // Aluno
  CONFIRMAR_AVISO: 'Confirmou leitura de aviso',
  ENTREGAR_ATIVIDADE: 'Entregou uma atividade',
  TENTAR_SIMULADO: 'Iniciou um simulado',

  // Gerais
  LOGIN: 'Realizou login',
  LOGOUT: 'Realizou logout',
  ATUALIZAR_PERFIL: 'Atualizou o perfil',
  ATIVAR_2FA: 'Ativou autenticação de dois fatores',
  DESATIVAR_2FA: 'Desativou autenticação de dois fatores',

  // Segurança e Acesso
  LOGIN_FALHO: 'Tentativa de login falhou',
  ACESSO_NEGADO: 'Tentativa de acesso não autorizado',
  SENHA_EXPIRADA: 'Senha expirada ao tentar acessar',
  CONTA_BLOQUEADA: 'Conta bloqueada por múltiplas tentativas',
  TOKEN_INVALIDO: 'Token de acesso inválido',
  '2FA_FALHA': 'Falha na autenticação de dois fatores',
  GERAR_CODIGO_ACESSO: 'Gerou código de acesso temporário',
  USAR_CODIGO_ACESSO: 'Usou código de acesso temporário',

  // Administração
  CREATE_USUARIO: 'Criou um usuário',
  UPDATE_USUARIO: 'Atualizou dados de usuário',
  DELETE_USUARIO: 'Excluiu um usuário',
  EXPORTAR_DADOS: 'Exportou dados do sistema',
  IMPORTAR_DADOS: 'Importou dados para o sistema',
  LIMPAR_AUDIT: 'Realizou limpeza de logs de auditoria',

  // Acadêmico
  MATRICULAR_ALUNO: 'Matriculou aluno em turma',
  DESMATRICULAR_ALUNO: 'Desmatriculou aluno de turma',
  ATRIBUIR_PROFESSOR: 'Atribuiu professor à disciplina',
  REMOVER_PROFESSOR: 'Removeu professor da disciplina',
  GERAR_RELATORIO: 'Gerou relatório acadêmico',

  // Transferência de Aluno
  TRANSFERIR_ALUNO: 'Transferiu aluno de turma',

  // Sistema
  ACESSAR_RECURSO: 'Acessou recurso do sistema',
  BAIXAR_ARQUIVO: 'Baixou arquivo do sistema',
  ENVIAR_EMAIL: 'Enviou email pelo sistema',
  BACKUP_REALIZADO: 'Realizou backup do sistema',
} as const;

export type AuditActionKey = keyof typeof AUDIT_ACTIONS;

export function getAuditAction(key: AuditActionKey): string {
  return AUDIT_ACTIONS[key] ?? key;
}
