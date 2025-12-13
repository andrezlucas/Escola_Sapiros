import { MigrationInterface, QueryRunner } from 'typeorm';
import { Role } from '../../usuario/entities/usuario.entity';
import { FuncaoCoordenacao } from '../../coordenacao/enums/funcao-coordenacao.enum';

// Dados fixos para o administrador inicial
const ADMIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const HASH_SENHA = '$2b$10$MkPIi4Em7rf/PQnYVs7bIOGlgBG0f9YAAhijlEZ72olugB4c4Ki9i'; // Hash de 'Admin@123'
const ADMIN_EMAIL = 'admin.sapiros@escola.com';
const ADMIN_CPF = '00000000000';
const ADMIN_NOME = 'Administrador Inicial';
const ROLE = Role.COORDENACAO;
const FUNCAO = FuncaoCoordenacao.DIRETOR;

export class CreateDatabaseAndSeedAdmin1765245341166 implements MigrationInterface {
  name = 'CreateDatabaseAndSeedAdmin1765245341166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================
    // CRIAÇÃO DE TABELAS
    // ============================

    // Usuarios
    await queryRunner.query(`
      CREATE TABLE usuarios (
        id CHAR(36) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        cpf VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        senha_expira_em TIMESTAMP DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 180 DAY)),
        senha_atualizada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_blocked BOOLEAN DEFAULT FALSE,
        role ENUM('aluno','professor','coordenacao') NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      );
    `);

    // Coordenacao
    await queryRunner.query(`
      CREATE TABLE coordenacao (
        id CHAR(36) NOT NULL,
        funcao ENUM('coordenador','diretor','secretario','administrador') NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_Coordenacao_Usuario FOREIGN KEY (id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    // Alunos
    await queryRunner.query(`
      CREATE TABLE alunos (
        id CHAR(36) NOT NULL,
        matricula_aluno VARCHAR(255) UNIQUE NOT NULL,
        serie_ano VARCHAR(255) NOT NULL,
        escola_origem VARCHAR(255),
        telefone VARCHAR(255) UNIQUE,
        data_nascimento DATE NOT NULL,
        sexo ENUM('MASCULINO','FEMININO','OUTRO','NAO_INFORMADO') DEFAULT 'NAO_INFORMADO',
        rg_numero VARCHAR(255) NOT NULL,
        rg_data_emissao DATE,
        rg_orgao_emissor VARCHAR(255),
        endereco_logradouro VARCHAR(255) NOT NULL,
        endereco_numero VARCHAR(255) NOT NULL,
        endereco_cep VARCHAR(255) NOT NULL,
        endereco_complemento VARCHAR(255),
        endereco_bairro VARCHAR(255) NOT NULL,
        endereco_estado CHAR(2) NOT NULL,
        endereco_cidade VARCHAR(255) NOT NULL,
        nacionalidade VARCHAR(255) NOT NULL,
        naturalidade VARCHAR(255) NOT NULL,
        possui_necessidades_especiais BOOLEAN DEFAULT FALSE,
        descricao_necessidades_especiais TEXT,
        possui_alergias BOOLEAN DEFAULT FALSE,
        descricao_alergias TEXT,
        autorizacao_uso_imagem BOOLEAN DEFAULT FALSE,
        responsavel_nome VARCHAR(255),
        responsavel_data_nascimento DATE,
        responsavel_sexo ENUM('MASCULINO','FEMININO','OUTRO','NAO_INFORMADO') DEFAULT 'NAO_INFORMADO',
        responsavel_nacionalidade VARCHAR(255),
        responsavel_naturalidade VARCHAR(255),
        responsavel_cpf VARCHAR(255),
        responsavel_rg VARCHAR(255),
        responsavel_rg_orgao_emissor VARCHAR(255),
        responsavel_telefone VARCHAR(255),
        responsavel_email VARCHAR(255),
        responsavel_cep VARCHAR(255),
        responsavel_logradouro VARCHAR(255),
        responsavel_numero VARCHAR(255),
        responsavel_complemento VARCHAR(255),
        responsavel_bairro VARCHAR(255),
        responsavel_cidade VARCHAR(255),
        responsavel_estado CHAR(2),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_Aluno_Usuario FOREIGN KEY (id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    // Professores
    await queryRunner.query(`
      CREATE TABLE professores (
        id CHAR(36) NOT NULL,
        formacao TEXT,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_Professor_Usuario FOREIGN KEY (id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    // Disciplinas
    await queryRunner.query(`
      CREATE TABLE disciplinas (
        id CHAR(36) NOT NULL,
        codigo VARCHAR(255) UNIQUE NOT NULL,
        nome_disciplina VARCHAR(255) NOT NULL,
        descricao TEXT,
        carga_horaria INT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      );
    `);

    // Turmas
    await queryRunner.query(`
      CREATE TABLE turmas (
        id CHAR(36) NOT NULL,
        nome_turma VARCHAR(255) NOT NULL,
        ano_letivo VARCHAR(255) NOT NULL,
        periodo VARCHAR(255) NOT NULL,
        data_inicio DATE NOT NULL,
        data_fim DATE NOT NULL,
        descricao TEXT,
        ativa BOOLEAN DEFAULT TRUE,
        professor_id CHAR(36),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_Turma_Professor FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE SET NULL
      );
    `);

    // Avisos
    await queryRunner.query(`
      CREATE TABLE avisos (
        id CHAR(36) NOT NULL,
        titulo VARCHAR(255) NOT NULL,
        conteudo TEXT NOT NULL,
        tipo ENUM('GERAL','TURMA','INDIVIDUAL') DEFAULT 'GERAL',
        data_publicacao TIMESTAMP NOT NULL,
        data_expiracao TIMESTAMP,
        usuario_id CHAR(36) NOT NULL,
        turma_id CHAR(36),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_Aviso_Usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        CONSTRAINT FK_Aviso_Turma FOREIGN KEY (turma_id) REFERENCES turmas(id)
      );
    `);

    // Frequencias
    await queryRunner.query(`
      CREATE TABLE frequencias (
        id CHAR(36) NOT NULL,
        data DATE NOT NULL,
        presente BOOLEAN DEFAULT FALSE,
        observacao TEXT,
        aluno_id CHAR(36) NOT NULL,
        disciplina_id CHAR(36) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_Frequencia_Aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
        CONSTRAINT FK_Frequencia_Disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
      );
    `);

    // Notas
    await queryRunner.query(`
      CREATE TABLE notas (
        id CHAR(36) NOT NULL,
        valor DECIMAL(5,2) NOT NULL,
        tipo_avaliacao ENUM('PROVA','TRABALHO','PROJETO','ATIVIDADE','OUTRO') DEFAULT 'PROVA',
        data DATE NOT NULL,
        observacao TEXT,
        aluno_id CHAR(36) NOT NULL,
        disciplina_id CHAR(36) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_Nota_Aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id),
        CONSTRAINT FK_Nota_Disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
      );
    `);

    // Relações ManyToMany Turma_Alunos
    await queryRunner.query(`
      CREATE TABLE alunos_turmas (
        turma_id CHAR(36) NOT NULL,
        aluno_id CHAR(36) NOT NULL,
        PRIMARY KEY (turma_id, aluno_id),
        CONSTRAINT FK_TurmaAluno_Turma FOREIGN KEY (turma_id) REFERENCES turmas(id),
        CONSTRAINT FK_TurmaAluno_Aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id)
      );
    `);

    // Relações ManyToMany Turma_Disciplinas
    await queryRunner.query(`
      CREATE TABLE turma_disciplinas (
        turma_id CHAR(36) NOT NULL,
        disciplina_id CHAR(36) NOT NULL,
        PRIMARY KEY (turma_id, disciplina_id),
        CONSTRAINT FK_TurmaDisciplina_Turma FOREIGN KEY (turma_id) REFERENCES turmas(id),
        CONSTRAINT FK_TurmaDisciplina_Disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id)
      );
    `);

    // ============================
    // RESET PASSWORD TOKENS
    // ============================
    await queryRunner.query(`
      CREATE TABLE reset_password_tokens (
        id CHAR(36) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expira_em TIMESTAMP NOT NULL,
        usuario_id CHAR(36) NOT NULL,
        PRIMARY KEY (id),
        CONSTRAINT FK_ResetPassword_Usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `);

    // ============================
    // INSERÇÃO DO ADMINISTRADOR
    // ============================
    await queryRunner.query(
      `INSERT INTO usuarios (id, nome, email, cpf, senha, role, senha_atualizada_em, criado_em, atualizado_em, is_blocked)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), FALSE)`,
      [ADMIN_ID, ADMIN_NOME, ADMIN_EMAIL, ADMIN_CPF, HASH_SENHA, ROLE]
    );

    await queryRunner.query(
      `INSERT INTO coordenacao (id, funcao, criado_em, atualizado_em)
        VALUES (?, ?, NOW(), NOW())`,
      [ADMIN_ID, FUNCAO]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS reset_password_tokens`);
    await queryRunner.query(`DROP TABLE IF EXISTS turma_disciplinas`);
    await queryRunner.query(`DROP TABLE IF EXISTS alunos_turmas`);
    await queryRunner.query(`DROP TABLE IF EXISTS notas`);
    await queryRunner.query(`DROP TABLE IF EXISTS frequencias`);
    await queryRunner.query(`DROP TABLE IF EXISTS avisos`);
    await queryRunner.query(`DROP TABLE IF EXISTS turmas`);
    await queryRunner.query(`DROP TABLE IF EXISTS disciplinas`);
    await queryRunner.query(`DROP TABLE IF EXISTS professores`);
    await queryRunner.query(`DROP TABLE IF EXISTS alunos`);
    await queryRunner.query(`DROP TABLE IF EXISTS coordenacao`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios`);
  }
}