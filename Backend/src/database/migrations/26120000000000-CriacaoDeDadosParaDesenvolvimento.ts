import { MigrationInterface, QueryRunner } from 'typeorm';

export class CriacaoDeDadosParaDesenvolvimento26120000000000
  implements MigrationInterface {

  name = 'CriacaoDeDadosParaDesenvolvimento26120000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // checar se tabelas essenciais existem (evita inserts em DB sem schema)
    const requiredTables = [
      'usuarios', 'professores', 'turmas', 'disciplinas', 'habilidades',
      'alunos', 'atividades', 'atividades_turmas', 'turma_disciplinas',
      'professores_disciplinas', 'avisos'
    ];

    const missing: string[] = [];
    for (const t of requiredTables) {
      // hasTable é assíncrono e consulta INFORMATION_SCHEMA
      // some schemas may have different casing; adapte se necessário
      const exists = await queryRunner.hasTable(t);
      if (!exists) missing.push(t);
    }

    if (missing.length > 0) {
      throw new Error(
        `SeedSchoolData26120000000000: tabelas requeridas ausentes: ${missing.join(
          ', ',
        )}. Rode primeiro as migrations de schema.`,
      );
    }

    // timestamps usados no seed
    const T_ADMIN = new Date('2025-01-01T10:00:00.000Z');
    const T_SEED = new Date('2025-02-10T12:00:00.000Z');

    const ADMIN_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    // IDs estáveis
    const TURMA_201 = '00000000-0000-0000-0000-000000000201';
    const TURMA_202 = '00000000-0000-0000-0000-000000000202';
    const TURMA_203 = '00000000-0000-0000-0000-000000000203';

    const DISC_301 = '00000000-0000-0000-0000-000000000301';
    const DISC_302 = '00000000-0000-0000-0000-000000000302';
    const DISC_303 = '00000000-0000-0000-0000-000000000303';
    const DISC_304 = '00000000-0000-0000-0000-000000000304';
    const DISC_305 = '00000000-0000-0000-0000-000000000305';

    const PROF_501 = '00000000-0000-0000-0000-000000000501';
    const PROF_502 = '00000000-0000-0000-0000-000000000502';
    const PROF_503 = '00000000-0000-0000-0000-000000000503';
    const PROF_504 = '00000000-0000-0000-0000-000000000504';

    const ALUNO_101 = '00000000-0000-0000-0000-000000000101';
    const ALUNO_102 = '00000000-0000-0000-0000-000000000102';
    const ALUNO_103 = '00000000-0000-0000-0000-000000000103';
    const ALUNO_104 = '00000000-0000-0000-0000-000000000104';
    const ALUNO_105 = '00000000-0000-0000-0000-000000000105';
    const ALUNO_106 = '00000000-0000-0000-0000-000000000106';
    const ALUNO_107 = '00000000-0000-0000-0000-000000000107';
    const ALUNO_108 = '00000000-0000-0000-0000-000000000108';
    const ALUNO_109 = '00000000-0000-0000-0000-000000000109';
    const ALUNO_110 = '00000000-0000-0000-0000-000000000110';

    const UAL_101 = '00000000-0000-0000-0000-000000001101';
    const UAL_102 = '00000000-0000-0000-0000-000000001102';
    const UAL_103 = '00000000-0000-0000-0000-000000001103';
    const UAL_104 = '00000000-0000-0000-0000-000000001104';
    const UAL_105 = '00000000-0000-0000-0000-000000001105';
    const UAL_106 = '00000000-0000-0000-0000-000000001106';
    const UAL_107 = '00000000-0000-0000-0000-000000001107';
    const UAL_108 = '00000000-0000-0000-0000-000000001108';
    const UAL_109 = '00000000-0000-0000-0000-000000001109';
    const UAL_110 = '00000000-0000-0000-0000-000000001110';

    const ATIV_601 = '00000000-0000-0000-0000-000000000601';
    const ATIV_602 = '00000000-0000-0000-0000-000000000602';
    const ATIV_603 = '00000000-0000-0000-0000-000000000603';
    const ATIV_604 = '00000000-0000-0000-0000-000000000604';
    const ATIV_605 = '00000000-0000-0000-0000-000000000605';
    const ATIV_606 = '00000000-0000-0000-0000-000000000606';

    const AVISO_701 = '00000000-0000-0000-0000-000000000701';
    const AVISO_702 = '00000000-0000-0000-0000-000000000702';
    const AVISO_703 = '00000000-0000-0000-0000-000000000703';
    const AVISO_704 = '00000000-0000-0000-0000-000000000704';

    const HABS: Array<{ id: string; disciplinaId: string; nome: string }> = [
      { id: '00000000-0000-0000-0000-000000000401', disciplinaId: DISC_301, nome: 'Operações básicas' },
      { id: '00000000-0000-0000-0000-000000000402', disciplinaId: DISC_301, nome: 'Frações e decimais' },
      { id: '00000000-0000-0000-0000-000000000403', disciplinaId: DISC_301, nome: 'Resolução de problemas' },

      { id: '00000000-0000-0000-0000-000000000404', disciplinaId: DISC_302, nome: 'Interpretação de texto' },
      { id: '00000000-0000-0000-0000-000000000405', disciplinaId: DISC_302, nome: 'Ortografia' },
      { id: '00000000-0000-0000-0000-000000000406', disciplinaId: DISC_302, nome: 'Produção de texto' },

      { id: '00000000-0000-0000-0000-000000000407', disciplinaId: DISC_303, nome: 'Brasil Colônia' },
      { id: '00000000-0000-0000-0000-000000000408', disciplinaId: DISC_303, nome: 'Brasil Império' },
      { id: '00000000-0000-0000-0000-000000000409', disciplinaId: DISC_303, nome: 'História contemporânea' },

      { id: '00000000-0000-0000-0000-000000000410', disciplinaId: DISC_304, nome: 'Ciclo da água' },
      { id: '00000000-0000-0000-0000-000000000411', disciplinaId: DISC_304, nome: 'Seres vivos' },
      { id: '00000000-0000-0000-0000-000000000412', disciplinaId: DISC_304, nome: 'Corpo humano' },

      { id: '00000000-0000-0000-0000-000000000413', disciplinaId: DISC_305, nome: 'Vocabulário básico' },
      { id: '00000000-0000-0000-0000-000000000414', disciplinaId: DISC_305, nome: 'Gramática fundamental' },
      { id: '00000000-0000-0000-0000-000000000415', disciplinaId: DISC_305, nome: 'Compreensão oral' },
    ];

    // helper: insere usuario
    const insertUsuario = async (row: {
      id: string;
      nome: string;
      email: string;
      cpf11: string;
      senha: string;
      role: 'aluno' | 'professor' | 'coordenacao';
      dataNascimento: Date;
      telefone: string;
      logradouro: string;
      numero: string;
      cep8: string;
      complemento?: string | null;
      bairro: string;
      estado: string;
      cidade: string;
    }) => {
      await queryRunner.query(
        `
          INSERT INTO usuarios (
            id, nome, email, cpf, senha, role, data_nascimento, telefone,
            endereco_logradouro, endereco_numero, endereco_cep, endereco_complemento,
            endereco_bairro, endereco_estado, endereco_cidade,
            sexo, is_blocked, senha_atualizada_em, criado_em, atualizado_em
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.nome,
          row.email,
          row.cpf11,
          row.senha,
          row.role,
          row.dataNascimento,
          row.telefone,
          row.logradouro,
          row.numero,
          row.cep8,
          row.complemento ?? null,
          row.bairro,
          row.estado,
          row.cidade,
          // Detecta sexo pelo nome
          row.nome.includes('Mariana') || row.nome.includes('Ana') || row.nome.includes('Larissa') ||
            row.nome.includes('Fernanda') || row.nome.includes('Beatriz') || row.nome.includes('Luiza') ||
            row.nome.includes('Rafaela') ? 'FEMININO' :
            row.nome.includes('Carlos') || row.nome.includes('Roberto') || row.nome.includes('Pedro') ||
              row.nome.includes('João') || row.nome.includes('Marcos') || row.nome.includes('Gabriel') ||
              row.nome.includes('Thiago') ? 'MASCULINO' :
              'OUTRO',
          0,
          T_SEED,
          T_SEED,
          T_SEED,
        ],
      );
    };

    // helper: insere aluno
    const insertAluno = async (row: {
      id: string;
      usuarioId: string;
      turmaId: string;
      matricula: string;
      serieAno: string;
      escolaOrigem: string;
      rgNumero: string;
      rgDataEmissao: Date;
      rgOrgao: string;
      naturalidade: string;
      responsavel: {
        nome: string;
        dataNascimento: Date;
        sexo: 'MASCULINO' | 'FEMININO' | 'OUTRO' | 'NAO_INFORMADO';
        nacionalidade: string;
        naturalidade: string;
        cpf: string;
        rg: string;
        rgOrgao: string;
        telefone: string;
        email: string;
        cep: string;
        logradouro: string;
        numero: string;
        complemento?: string | null;
        bairro: string;
        cidade: string;
        estado: string;
      };
    }) => {
      await queryRunner.query(
        `
          INSERT INTO alunos (
            id, usuario_id, turma_id,
            matricula_aluno, serie_ano, escola_origem,
            rg_numero, rg_data_emissao, rg_orgao_emissor,
            nacionalidade, naturalidade,
            possui_necessidades_especiais, descricao_necessidades_especiais,
            possui_alergias, descricao_alergias,
            autorizacao_uso_imagem,
            responsavel_nome, responsavel_data_nascimento, responsavel_sexo,
            responsavel_nacionalidade, responsavel_naturalidade,
            responsavel_cpf, responsavel_rg, responsavel_rg_orgao_emissor,
            responsavel_telefone, responsavel_email,
            responsavel_cep, responsavel_logradouro, responsavel_numero, responsavel_complemento,
            responsavel_bairro, responsavel_cidade, responsavel_estado,
            criado_em, atualizado_em
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          row.id,
          row.usuarioId,
          row.turmaId,
          row.matricula,
          row.serieAno,
          row.escolaOrigem,
          row.rgNumero,
          row.rgDataEmissao,
          row.rgOrgao,
          'Brasileira',
          row.naturalidade,
          0,
          null,
          0,
          null,
          1,
          row.responsavel.nome,
          row.responsavel.dataNascimento,
          row.responsavel.sexo,
          row.responsavel.nacionalidade,
          row.responsavel.naturalidade,
          row.responsavel.cpf,
          row.responsavel.rg,
          row.responsavel.rgOrgao,
          row.responsavel.telefone,
          row.responsavel.email,
          row.responsavel.cep.replace('-', ''),
          row.responsavel.logradouro,
          row.responsavel.numero,
          row.responsavel.complemento ?? null,
          row.responsavel.bairro,
          row.responsavel.cidade,
          row.responsavel.estado,
          T_SEED,
          T_SEED,
        ],
      );
    };

    // === Insere admin se não existir ===
    const adminExists: any[] = await queryRunner.query(
      `SELECT id FROM usuarios WHERE id = ? LIMIT 1`,
      [ADMIN_ID],
    );

    if (!adminExists || adminExists.length === 0) {
      await queryRunner.query(
        `
          INSERT INTO usuarios (
            id, nome, email, cpf, senha, role, data_nascimento, telefone,
            endereco_logradouro, endereco_numero, endereco_cep, endereco_complemento,
            endereco_bairro, endereco_estado, endereco_cidade,
            sexo, is_blocked, senha_atualizada_em, criado_em, atualizado_em
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          ADMIN_ID,
          'Admin Escola',
          'admin@escola.test',
          '00000000000',
          '$2b$10$auvGI/kPvv9eiR7p9CFQZuS0.hfJPQzYnXa1JGZxGLGdEsBGw/eK2',
          'coordenacao',
          new Date('1990-01-01T00:00:00.000Z'),
          '11990000000',
          'Av. Paulista',
          '1000',
          '01310000',
          'Conj. 101',
          'Bela Vista',
          'SP',
          'São Paulo',
          'NAO_INFORMADO',
          0,
          T_ADMIN,
          T_ADMIN,
          T_ADMIN,
        ],
      );

      // se existir tabela coordenacao, adiciona registro correspondente
      if (await queryRunner.hasTable('coordenacao')) {
        await queryRunner.query(
          `INSERT INTO coordenacao (id, funcao, criado_em, atualizado_em) VALUES (?, ?, ?, ?)`,
          [ADMIN_ID, 'administrador', T_ADMIN, T_ADMIN],
        );
      }
    }

    // === 1) disciplinas ===
    await queryRunner.query(
      `
      INSERT INTO disciplinas (
        id_disciplina, codigo_disciplina, nome_disciplina, cargaHoraria, disciplinacriadoEm, disciplinaatualizadoEm
      ) VALUES
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?)
    `,
      [
        DISC_301, 'MAT', 'Matemática', 80, T_SEED, T_SEED,
        DISC_302, 'POR', 'Português', 80, T_SEED, T_SEED,
        DISC_303, 'HIS', 'História', 60, T_SEED, T_SEED,
        DISC_304, 'CIE', 'Ciências', 60, T_SEED, T_SEED,
        DISC_305, 'ING', 'Inglês', 60, T_SEED, T_SEED,
      ],
    );

    // === 2) turmas ===
    await queryRunner.query(
      `
      INSERT INTO turmas (
        id, nome_turma, capacidade_maxima, ano_letivo, turno, ativa, professor_id, criado_em, atualizado_em
      ) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        TURMA_201, '3A - 2026', 35, '2026', 'Noite', 1, null, T_SEED, T_SEED,
        TURMA_202, '2B - 2026', 35, '2026', 'Manhã', 1, null, T_SEED, T_SEED,
        TURMA_203, '1C - 2026', 35, '2026', 'Tarde', 1, null, T_SEED, T_SEED,
      ],
    );

    // === 3) professores (usuarios + professores) ===
    const HASH_PROF = '$2b$10$auvGI/kPvv9eiR7p9CFQZuS0.hfJPQzYnXa1JGZxGLGdEsBGw/eK2';

    await insertUsuario({
      id: PROF_501,
      nome: 'Carlos Menezes',
      email: 'carlos.m@escola.test',
      cpf11: '10433218100',
      senha: HASH_PROF,
      role: 'professor',
      dataNascimento: new Date('1983-05-10T00:00:00.000Z'),
      telefone: '11990000501',
      logradouro: 'Praça da Sé',
      numero: '10',
      cep8: '01001000',
      complemento: null,
      bairro: 'Sé',
      estado: 'SP',
      cidade: 'São Paulo',
    });

    await insertUsuario({
      id: PROF_502,
      nome: 'Mariana Alves',
      email: 'mariana.a@escola.test',
      cpf11: '96001338914',
      senha: HASH_PROF,
      role: 'professor',
      dataNascimento: new Date('1987-08-22T00:00:00.000Z'),
      telefone: '21990000502',
      logradouro: 'Rua Primeiro de Março',
      numero: '200',
      cep8: '20010000',
      complemento: 'Sala 12',
      bairro: 'Centro',
      estado: 'RJ',
      cidade: 'Rio de Janeiro',
    });

    await insertUsuario({
      id: PROF_503,
      nome: 'Roberto Lima',
      email: 'roberto.l@escola.test',
      cpf11: '08386379499',
      senha: HASH_PROF,
      role: 'professor',
      dataNascimento: new Date('1981-02-03T00:00:00.000Z'),
      telefone: '31990000503',
      logradouro: 'Av. Afonso Pena',
      numero: '300',
      cep8: '30110000',
      complemento: null,
      bairro: 'Centro',
      estado: 'MG',
      cidade: 'Belo Horizonte',
    });

    await insertUsuario({
      id: PROF_504,
      nome: 'Ana Souza',
      email: 'ana.s@escola.test',
      cpf11: '02654235114',
      senha: HASH_PROF,
      role: 'professor',
      dataNascimento: new Date('1990-11-12T00:00:00.000Z'),
      telefone: '71990000504',
      logradouro: 'Av. Sete de Setembro',
      numero: '400',
      cep8: '40020000',
      complemento: 'Apto 402',
      bairro: 'Dois de Julho',
      estado: 'BA',
      cidade: 'Salvador',
    });

    await queryRunner.query(
      `
      INSERT INTO professores (id, criado_em, atualizado_em)
      VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)
    `,
      [PROF_501, T_SEED, T_SEED, PROF_502, T_SEED, T_SEED, PROF_503, T_SEED, T_SEED, PROF_504, T_SEED, T_SEED],
    );

    // atualiza professor responsável por turma
    await queryRunner.query(`UPDATE turmas SET professor_id = ? WHERE id = ?`, [PROF_501, TURMA_201]);
    await queryRunner.query(`UPDATE turmas SET professor_id = ? WHERE id = ?`, [PROF_502, TURMA_202]);
    await queryRunner.query(`UPDATE turmas SET professor_id = ? WHERE id = ?`, [PROF_503, TURMA_203]);

    // === 4) habilidades ===
    for (const h of HABS) {
      await queryRunner.query(
        `INSERT INTO habilidades (id, disciplina_id, nome, descricao, criadoEm, atualizadoEm) VALUES (?, ?, ?, ?, ?, ?)`,
        [h.id, h.disciplinaId, h.nome, null, T_SEED, T_SEED],
      );
    }

    // === 5) alunos (usuarios + alunos) ===
    const HASH_ALUNO = '$2b$10$auvGI/kPvv9eiR7p9CFQZuS0.hfJPQzYnXa1JGZxGLGdEsBGw/eK2';

    const alunosUsuarios = [
      { id: UAL_101, nome: 'Pedro Silva', email: 'pedro.s@aluno.test', cpf11: '16155940789', tel: '81990000101', cep8: '50010000', cidade: 'Recife', estado: 'PE', logradouro: 'Rua do Imperador', numero: '50', compl: null, bairro: 'Santo Antônio', nasc: new Date('2010-03-05T00:00:00.000Z') },
      { id: UAL_102, nome: 'João Pereira', email: 'joao.p@aluno.test', cpf11: '81618495950', tel: '85990000102', cep8: '60010000', cidade: 'Fortaleza', estado: 'CE', logradouro: 'Av. Duque de Caxias', numero: '120', compl: 'Casa', bairro: 'Centro', nasc: new Date('2010-07-19T00:00:00.000Z') },
      { id: UAL_103, nome: 'Marcos Santos', email: 'marcos.s@aluno.test', cpf11: '31034131656', tel: '61990000103', cep8: '70040010', cidade: 'Brasília', estado: 'DF', logradouro: 'SQS 103', numero: '10', compl: 'Bloco A', bairro: 'Asa Sul', nasc: new Date('2010-10-01T00:00:00.000Z') },
      { id: UAL_104, nome: 'Larissa Oliveira', email: 'larissa.o@aluno.test', cpf11: '47525534144', tel: '41990000104', cep8: '80010000', cidade: 'Curitiba', estado: 'PR', logradouro: 'Rua XV de Novembro', numero: '800', compl: null, bairro: 'Centro', nasc: new Date('2011-01-28T00:00:00.000Z') },
      { id: UAL_105, nome: 'Fernanda Costa', email: 'fernanda.c@aluno.test', cpf11: '92832764851', tel: '51990000105', cep8: '90010000', cidade: 'Porto Alegre', estado: 'RS', logradouro: 'Av. Borges de Medeiros', numero: '900', compl: 'Apto 91', bairro: 'Centro Histórico', nasc: new Date('2011-05-14T00:00:00.000Z') },
      { id: UAL_106, nome: 'Beatriz Ribeiro', email: 'beatriz.r@aluno.test', cpf11: '35030564160', tel: '92990000106', cep8: '69010000', cidade: 'Manaus', estado: 'AM', logradouro: 'Rua dos Barés', numero: '690', compl: null, bairro: 'Centro', nasc: new Date('2011-09-30T00:00:00.000Z') },
      { id: UAL_107, nome: 'Gabriel Rocha', email: 'gabriel.r@aluno.test', cpf11: '70257169450', tel: '85990000107', cep8: '66010000', cidade: 'Belém', estado: 'PA', logradouro: 'Av. Almirante Barroso', numero: '660', compl: null, bairro: 'Campina', nasc: new Date('2010-12-12T00:00:00.000Z') },
      { id: UAL_108, nome: 'Luiza Almeida', email: 'luiza.a@aluno.test', cpf11: '11144477735', tel: '11990000108', cep8: '01001000', cidade: 'São Paulo', estado: 'SP', logradouro: 'Praça da Sé', numero: '1', compl: null, bairro: 'Sé', nasc: new Date('2010-02-08T00:00:00.000Z') },
      { id: UAL_109, nome: 'Rafaela Martins', email: 'rafaela.m@aluno.test', cpf11: '52998224725', tel: '21990000109', cep8: '20010000', cidade: 'Rio de Janeiro', estado: 'RJ', logradouro: 'Rua da Assembleia', numero: '20', compl: null, bairro: 'Centro', nasc: new Date('2010-06-25T00:00:00.000Z') },
      { id: UAL_110, nome: 'Thiago Fernandes', email: 'thiago.f@aluno.test', cpf11: '39053344705', tel: '31990000110', cep8: '30110000', cidade: 'Belo Horizonte', estado: 'MG', logradouro: 'Av. Afonso Pena', numero: '30', compl: null, bairro: 'Centro', nasc: new Date('2010-09-09T00:00:00.000Z') },
    ];

    for (const u of alunosUsuarios) {
      await insertUsuario({
        id: u.id,
        nome: u.nome,
        email: u.email,
        cpf11: u.cpf11,
        senha: HASH_ALUNO,
        role: 'aluno',
        dataNascimento: u.nasc,
        telefone: u.tel,
        logradouro: u.logradouro,
        numero: u.numero,
        cep8: u.cep8,
        complemento: u.compl,
        bairro: u.bairro,
        estado: u.estado,
        cidade: u.cidade,
      });
    }

    const respCpfs = [
      '74185296355',
      '31415926590',
      '27182818205',
      '13579135759',
      '24681357928',
      '90909090955',
      '10293847541',
      '56473829164',
      '80817263578',
      '16899535009',
    ];

    const alunos = [
      { alunoId: ALUNO_101, usuarioId: UAL_101, turmaId: TURMA_201, matricula: '2025-3A-0001', nome: 'Pedro Silva', natural: 'Recife/PE', rg: 'RG1010001', rgUf: 'SSP/PE', escola: 'Escola Municipal do Recife', respCpf: respCpfs[0] },
      { alunoId: ALUNO_102, usuarioId: UAL_102, turmaId: TURMA_201, matricula: '2025-3A-0002', nome: 'João Pereira', natural: 'Fortaleza/CE', rg: 'RG1020002', rgUf: 'SSP/CE', escola: 'Escola Municipal de Fortaleza', respCpf: respCpfs[1] },
      { alunoId: ALUNO_103, usuarioId: UAL_103, turmaId: TURMA_201, matricula: '2025-3A-0003', nome: 'Marcos Santos', natural: 'Brasília/DF', rg: 'RG1030003', rgUf: 'SSP/DF', escola: 'Escola Pública do DF', respCpf: respCpfs[2] },
      { alunoId: ALUNO_104, usuarioId: UAL_104, turmaId: TURMA_202, matricula: '2025-2B-0001', nome: 'Larissa Oliveira', natural: 'Curitiba/PR', rg: 'RG1040004', rgUf: 'SSP/PR', escola: 'Escola Estadual do Paraná', respCpf: respCpfs[3] },
      { alunoId: ALUNO_105, usuarioId: UAL_105, turmaId: TURMA_202, matricula: '2025-2B-0002', nome: 'Fernanda Costa', natural: 'Porto Alegre/RS', rg: 'RG1050005', rgUf: 'SSP/RS', escola: 'Escola Municipal de Porto Alegre', respCpf: respCpfs[4] },
      { alunoId: ALUNO_106, usuarioId: UAL_106, turmaId: TURMA_202, matricula: '2025-2B-0003', nome: 'Beatriz Ribeiro', natural: 'Manaus/AM', rg: 'RG1060006', rgUf: 'SSP/AM', escola: 'Escola Estadual do Amazonas', respCpf: respCpfs[5] },
      { alunoId: ALUNO_107, usuarioId: UAL_107, turmaId: TURMA_203, matricula: '2025-1C-0001', nome: 'Gabriel Rocha', natural: 'Belém/PA', rg: 'RG1070007', rgUf: 'SSP/PA', escola: 'Escola Estadual do Pará', respCpf: respCpfs[6] },
      { alunoId: ALUNO_108, usuarioId: UAL_108, turmaId: TURMA_203, matricula: '2025-1C-0002', nome: 'Luiza Almeida', natural: 'São Paulo/SP', rg: 'RG1080008', rgUf: 'SSP/SP', escola: 'Escola Estadual de SP', respCpf: respCpfs[7] },
      { alunoId: ALUNO_109, usuarioId: UAL_109, turmaId: TURMA_203, matricula: '2025-1C-0003', nome: 'Rafaela Martins', natural: 'Rio de Janeiro/RJ', rg: 'RG1090009', rgUf: 'SSP/RJ', escola: 'Escola Municipal do RJ', respCpf: respCpfs[8] },
      { alunoId: ALUNO_110, usuarioId: UAL_110, turmaId: TURMA_201, matricula: '2025-3A-0004', nome: 'Thiago Fernandes', natural: 'Belo Horizonte/MG', rg: 'RG1100010', rgUf: 'SSP/MG', escola: 'Escola Estadual de MG', respCpf: respCpfs[9] },
    ];

    let idx = 0;
    for (const a of alunos) {
      idx += 1;
      await insertAluno({
        id: a.alunoId,
        usuarioId: a.usuarioId,
        turmaId: a.turmaId,
        matricula: a.matricula,
        serieAno: a.turmaId === TURMA_201 ? '3º Ano' : a.turmaId === TURMA_202 ? '2º Ano' : '1º Ano',
        escolaOrigem: a.escola,
        rgNumero: a.rg,
        rgDataEmissao: new Date(`2023-0${Math.min(9, idx)}-10T00:00:00.000Z`),
        rgOrgao: a.rgUf,
        naturalidade: a.natural,
        responsavel: {
          nome: `Responsável ${idx}`,
          dataNascimento: new Date('1985-04-20T00:00:00.000Z'),
          sexo: 'NAO_INFORMADO',
          nacionalidade: 'Brasileira',
          naturalidade: a.natural,
          cpf: a.respCpf,
          rg: `RGRESP${idx.toString().padStart(3, '0')}`,
          rgOrgao: a.rgUf,
          telefone: `1198888${(1000 + idx).toString().slice(-4)}`,
          email: `responsavel.${idx}@familia.test`,
          cep: idx % 2 === 0 ? '01001000' : '20010000',
          logradouro: 'Rua do Responsável',
          numero: `${100 + idx}`,
          complemento: null,
          bairro: 'Centro',
          cidade: a.natural.split('/')[0],
          estado: a.natural.split('/')[1] ?? 'BR',
        },
      });
    }

    // === 6) Relacionamentos ===
    for (const turmaId of [TURMA_201, TURMA_202, TURMA_203]) {
      for (const discId of [DISC_301, DISC_302, DISC_303, DISC_304, DISC_305]) {
        await queryRunner.query(
          `INSERT INTO turma_disciplinas (turma_id, disciplina_id) VALUES (?, ?)`,
          [turmaId, discId],
        );
      }
    }

    const profDisc = [
      [PROF_501, DISC_301],
      [PROF_501, DISC_305],
      [PROF_502, DISC_302],
      [PROF_502, DISC_303],
      [PROF_503, DISC_304],
      [PROF_504, DISC_305],
      [PROF_504, DISC_301],
    ];
    for (const [profId, discId] of profDisc) {
      await queryRunner.query(
        `INSERT INTO professores_disciplinas (professor_id, disciplina_id) VALUES (?, ?)`,
        [profId, discId],
      );
    }

    // === 7) atividades + atividades_turmas ===
    const atividades = [
      { id: ATIV_601, titulo: 'Simulado MAT - Turma 3A', desc: 'Tipo: simulado', bimestre: '3º Bimestre', dataEntrega: new Date('2026-03-15T09:00:00.000Z'), valor: 10.0, prof: PROF_501, disc: DISC_301, turma: TURMA_201 },
      { id: ATIV_602, titulo: 'Simulado PORT - Turma 2B', desc: 'Tipo: simulado', bimestre: '4º Bimestre', dataEntrega: new Date('2026-03-16T09:00:00.000Z'), valor: 10.0, prof: PROF_502, disc: DISC_302, turma: TURMA_202 },
      { id: ATIV_603, titulo: 'Simulado CIEN - Turma 1C', desc: 'Tipo: simulado', bimestre: '1º Bimestre', dataEntrega: new Date('2026-03-17T09:00:00.000Z'), valor: 10.0, prof: PROF_503, disc: DISC_304, turma: TURMA_203 },
      { id: ATIV_604, titulo: 'Prova HIST - Turma 3A', desc: 'Tipo: prova', bimestre: '2º Bimestre', dataEntrega: new Date('2026-04-01T10:00:00.000Z'), valor: 8.0, prof: PROF_502, disc: DISC_303, turma: TURMA_201 },
      { id: ATIV_605, titulo: 'Trabalho ING - Turma 2B', desc: 'Tipo: trabalho', bimestre: '2º Bimestre', dataEntrega: new Date('2026-04-05T10:00:00.000Z'), valor: 7.5, prof: PROF_504, disc: DISC_305, turma: TURMA_202 },
      { id: ATIV_606, titulo: 'Tarefa MAT - Turma 1C', desc: 'Tipo: tarefa', bimestre: '2º Bimestre', dataEntrega: new Date('2026-04-10T23:59:00.000Z'), valor: 2.0, prof: PROF_501, disc: DISC_301, turma: TURMA_203 },
    ];

    for (const a of atividades) {
      await queryRunner.query(
        `
          INSERT INTO atividades (
            id, versao, titulo, descricao, bimestre, data_entrega, valor, ativa,
            professor_id, disciplina_id, criado_em, atualizado_em
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [a.id, 1, a.titulo, a.desc, a.bimestre, a.dataEntrega, a.valor, 1, a.prof, a.disc, T_SEED, T_SEED],
      );

      await queryRunner.query(`INSERT INTO atividades_turmas (atividade_id, turma_id) VALUES (?, ?)`, [a.id, a.turma]);
    }
    
    // === 8) questões + alternativas ===
    const questoes = [
      // Questões para Simulado MAT - Turma 3A (ATIV_601)
      {
        id: '00000000-0000-0000-0000-000000000701',
        enunciado: 'Qual é o resultado de 15 × 8?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_601,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000801', texto: '100', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000802', texto: '110', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000803', texto: '120', correta: true, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000804', texto: '130', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000702',
        enunciado: 'Resolva a equação: 2x + 5 = 17',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_601,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000805', texto: 'x = 5', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000806', texto: 'x = 6', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000807', texto: 'x = 7', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000808', texto: 'x = 8', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000703',
        enunciado: 'Qual é a área de um quadrado com lado de 5cm?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_601,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000809', texto: '20 cm²', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000810', texto: '25 cm²', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000811', texto: '30 cm²', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000812', texto: '35 cm²', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000704',
        enunciado: 'Qual fração representa 50%?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_601,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000813', texto: '1/4', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000814', texto: '1/3', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000815', texto: '1/2', correta: true, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000816', texto: '2/3', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000705',
        enunciado: 'Qual é o MMC de 12 e 18?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_601,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000817', texto: '24', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000818', texto: '30', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000819', texto: '36', correta: true, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000820', texto: '42', correta: false, letra: 'D' }
        ]
      },

      // Questões para Simulado PORT - Turma 2B (ATIV_602)
      {
        id: '00000000-0000-0000-0000-000000000706',
        enunciado: 'Qual é o sujeito da frase: "O menino correu no parque"?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_602,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000821', texto: 'O parque', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000822', texto: 'O menino', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000823', texto: 'Correu', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000824', texto: 'No parque', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000707',
        enunciado: 'Marque a alternativa com um verbo no pretérito perfeito:',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_602,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000825', texto: 'Eu corro', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000826', texto: 'Eu corri', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000827', texto: 'Eu correrei', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000828', texto: 'Eu correndo', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000708',
        enunciado: 'Qual é o antônimo da palavra "feliz"?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_602,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000829', texto: 'Alegre', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000830', texto: 'Triste', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000831', texto: 'Contente', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000832', texto: 'Feliz', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000709',
        enunciado: 'Assinale a palavra que tem 5 sílabas:',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_602,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000833', texto: 'Casa', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000834', texto: 'Computador', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000835', texto: 'Extraordinariamente', correta: true, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000836', texto: 'Livro', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000710',
        enunciado: 'Qual é o plural correto de "pão"?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_602,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000837', texto: 'Pãos', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000838', texto: 'Pães', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000839', texto: 'Pãoes', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000840', texto: 'Pãis', correta: false, letra: 'D' }
        ]
      },

      // Questões para Simulado CIEN - Turma 1C (ATIV_603)
      {
        id: '00000000-0000-0000-0000-000000000711',
        enunciado: 'Qual é a fórmula química da água?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_603,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000841', texto: 'H2O', correta: true, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000842', texto: 'CO2', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000843', texto: 'O2', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000844', texto: 'H2O2', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000712',
        enunciado: 'Qual é o planeta mais próximo do Sol?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_603,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000845', texto: 'Vênus', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000846', texto: 'Terra', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000847', texto: 'Mercúrio', correta: true, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000848', texto: 'Marte', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000713',
        enunciado: 'Qual é a função da clorofila nas plantas?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_603,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000849', texto: 'Reprodução', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000850', texto: 'Fotossíntese', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000851', texto: 'Respiração', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000852', texto: 'Transpiração', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000714',
        enunciado: 'Qual é a unidade de medida de força?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_603,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000853', texto: 'Newton', correta: true, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000854', texto: 'Joule', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000855', texto: 'Watt', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000856', texto: 'Pascal', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000715',
        enunciado: 'Qual é o processo de transformação de líquido em gás?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_603,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000857', texto: 'Fusão', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000858', texto: 'Solidificação', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000859', texto: 'Evaporação', correta: true, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000860', texto: 'Condensação', correta: false, letra: 'D' }
        ]
      },

      // Questões para Prova HIST - Turma 3A (ATIV_604)
      {
        id: '00000000-0000-0000-0000-000000000716',
        enunciado: 'Em que ano o Brasil foi descoberto?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_604,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000861', texto: '1498', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000862', texto: '1500', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000863', texto: '1522', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000864', texto: '1530', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000717',
        enunciado: 'Quem foi o primeiro imperador do Brasil?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_604,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000865', texto: 'Dom Pedro I', correta: true, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000866', texto: 'Dom Pedro II', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000867', texto: 'Dom João VI', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000868', texto: 'Tiradentes', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000718',
        enunciado: 'Qual foi a capital do Brasil antes de Brasília?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_604,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000869', texto: 'São Paulo', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000870', texto: 'Rio de Janeiro', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000871', texto: 'Salvador', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000872', texto: 'Belo Horizonte', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000719',
        enunciado: 'Em que período aconteceu a Revolução Francesa?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.0,
        atividadeId: ATIV_604,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000873', texto: 'Século XVI', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000874', texto: 'Século XVII', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000875', texto: 'Século XVIII', correta: true, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000876', texto: 'Século XIX', correta: false, letra: 'D' }
        ]
      },

      // Questões para Trabalho ING - Turma 2B (ATIV_605)
      {
        id: '00000000-0000-0000-0000-000000000720',
        enunciado: 'Choose the correct form: "I ___ to school every day."',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.5,
        atividadeId: ATIV_605,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000877', texto: 'go', correta: true, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000878', texto: 'goes', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000879', texto: 'going', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000880', texto: 'went', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000721',
        enunciado: 'What is the past tense of "eat"?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.5,
        atividadeId: ATIV_605,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000881', texto: 'eated', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000882', texto: 'ate', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000883', texto: 'eaten', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000884', texto: 'eating', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000722',
        enunciado: 'Complete: "She is ___ doctor."',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 2.5,
        atividadeId: ATIV_605,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000885', texto: 'a', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000886', texto: 'an', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000887', texto: 'the', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000888', texto: 'some', correta: false, letra: 'D' }
        ]
      },

      // Questões para Tarefa MAT - Turma 1C (ATIV_606)
      {
        id: '00000000-0000-0000-0000-000000000723',
        enunciado: 'Qual é o resultado de 7 + 9?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 1.0,
        atividadeId: ATIV_606,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000889', texto: '14', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000890', texto: '15', correta: false, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000891', texto: '16', correta: true, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000892', texto: '17', correta: false, letra: 'D' }
        ]
      },
      {
        id: '00000000-0000-0000-0000-000000000724',
        enunciado: 'Quantos lados tem um triângulo?',
        tipo: 'MULTIPLA_ESCOLHA',
        valor: 1.0,
        atividadeId: ATIV_606,
        alternativas: [
          { id: '00000000-0000-0000-0000-000000000893', texto: '2', correta: false, letra: 'A' },
          { id: '00000000-0000-0000-0000-000000000894', texto: '3', correta: true, letra: 'B' },
          { id: '00000000-0000-0000-0000-000000000895', texto: '4', correta: false, letra: 'C' },
          { id: '00000000-0000-0000-0000-000000000896', texto: '5', correta: false, letra: 'D' }
        ]
      }
    ];

    for (const q of questoes) {
      // Inserir questão
      await queryRunner.query(
        `INSERT INTO questoes (id, enunciado, tipo, valor, atividade_id, criado_em, atualizado_em) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [q.id, q.enunciado, q.tipo, q.valor, q.atividadeId, T_SEED, T_SEED]
      );

      // Inserir alternativas
      for (const alt of q.alternativas) {
        await queryRunner.query(
          `INSERT INTO alternativas (id, texto, correta, letra, questao_id, criado_em, atualizado_em) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [alt.id, alt.texto, alt.correta, alt.letra, q.id, T_SEED, T_SEED]
        );
      }
    }

    // === 9) avisos ===
    await queryRunner.query(
      `
        INSERT INTO avisos (
          id, nome, descricao, tipo, categoria,
          data_inicio, data_final,
          usuario_id, turma_id,
          destinatario_aluno_id, destinatario_professor_id,
          criado_em, atualizado_em
        ) VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        AVISO_701,
        'Reunião de pais',
        'Reunião geral de pais e responsáveis em 15/02/2026 às 19:00.',
        'GERAL',
        'ACADEMICO',
        new Date('2026-02-15T19:00:00.000Z'),
        null,
        ADMIN_ID,
        null,
        null,
        null,
        T_SEED,
        T_SEED,

        AVISO_702,
        'Aviso Turma 3A',
        'Prova de Matemática adiada para 10/03/2026.',
        'TURMA',
        'ACADEMICO',
        new Date('2026-03-01T12:00:00.000Z'),
        null,
        PROF_501,
        TURMA_201,
        null,
        null,
        T_SEED,
        T_SEED,

        AVISO_703,
        'Aviso ao Professor',
        'Atualize os planos de aula até 20/04/2026.',
        'INDIVIDUAL',
        'SECRETARIA',
        new Date('2026-04-10T10:00:00.000Z'),
        null,
        ADMIN_ID,
        null,
        null,
        PROF_502,
        T_SEED,
        T_SEED,

        AVISO_704,
        'Aviso individual',
        'Compareça à coordenação para tratar sobre matrícula.',
        'INDIVIDUAL',
        'SECRETARIA',
        new Date('2026-06-15T10:00:00.000Z'),
        null,
        ADMIN_ID,
        null,
        ALUNO_101,
        null,
        T_SEED,
        T_SEED,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // rollback: remove apenas os registros seedados (mesmos ids usados no up)
    const turmas = [
      '00000000-0000-0000-0000-000000000201',
      '00000000-0000-0000-0000-000000000202',
      '00000000-0000-0000-0000-000000000203',
    ];

    const disciplinas = [
      '00000000-0000-0000-0000-000000000301',
      '00000000-0000-0000-0000-000000000302',
      '00000000-0000-0000-0000-000000000303',
      '00000000-0000-0000-0000-000000000304',
      '00000000-0000-0000-0000-000000000305',
    ];

    const professores = [
      '00000000-0000-0000-0000-000000000501',
      '00000000-0000-0000-0000-000000000502',
      '00000000-0000-0000-0000-000000000503',
      '00000000-0000-0000-0000-000000000504',
    ];

    const alunos = [
      '00000000-0000-0000-0000-000000000101',
      '00000000-0000-0000-0000-000000000102',
      '00000000-0000-0000-0000-000000000103',
      '00000000-0000-0000-0000-000000000104',
      '00000000-0000-0000-0000-000000000105',
      '00000000-0000-0000-0000-000000000106',
      '00000000-0000-0000-0000-000000000107',
      '00000000-0000-0000-0000-000000000108',
      '00000000-0000-0000-0000-000000000109',
      '00000000-0000-0000-0000-000000000110',
    ];

    const usuariosAlunos = [
      '00000000-0000-0000-0000-000000001101',
      '00000000-0000-0000-0000-000000001102',
      '00000000-0000-0000-0000-000000001103',
      '00000000-0000-0000-0000-000000001104',
      '00000000-0000-0000-0000-000000001105',
      '00000000-0000-0000-0000-000000001106',
      '00000000-0000-0000-0000-000000001107',
      '00000000-0000-0000-0000-000000001108',
      '00000000-0000-0000-0000-000000001109',
      '00000000-0000-0000-0000-000000001110',
    ];

    const habilidades = Array.from({ length: 15 }, (_, i) => {
      const n = 401 + i;
      return `00000000-0000-0000-0000-000000000${n}`;
    });

    const atividades = [
      '00000000-0000-0000-0000-000000000601',
      '00000000-0000-0000-0000-000000000602',
      '00000000-0000-0000-0000-000000000603',
      '00000000-0000-0000-0000-000000000604',
      '00000000-0000-0000-0000-000000000605',
      '00000000-0000-0000-0000-000000000606',
    ];

    const avisos = [
      '00000000-0000-0000-0000-000000000701',
      '00000000-0000-0000-0000-000000000702',
      '00000000-0000-0000-0000-000000000703',
      '00000000-0000-0000-0000-000000000704',
    ];

    const delIn = async (table: string, column: string, ids: string[]) => {
      if (!ids || ids.length === 0) return;
      const placeholders = ids.map(() => '?').join(',');
      await queryRunner.query(`DELETE FROM ${table} WHERE ${column} IN (${placeholders})`, ids);
    };

    await delIn('avisos', 'id', avisos);

    await delIn('atividades_turmas', 'atividade_id', atividades);
    await delIn('atividades', 'id', atividades);

    await queryRunner.query(`UPDATE turmas SET professor_id = NULL WHERE id IN (${turmas.map(() => '?').join(',')})`, turmas);

    await queryRunner.query(
      `DELETE FROM professores_disciplinas WHERE professor_id IN (${professores.map(() => '?').join(',')})`,
      professores,
    );
    await queryRunner.query(
      `DELETE FROM turma_disciplinas WHERE turma_id IN (${turmas.map(() => '?').join(',')})`,
      turmas,
    );

    await delIn('habilidades', 'id', habilidades);

    await delIn('alunos', 'id', alunos);

    await delIn('professores', 'id', professores);

    // Remove usuários seedados (alunos + professores). Não remove admin.
    await delIn('usuarios', 'id', [...usuariosAlunos, ...professores]);

    // Remover turmas e disciplinas seedadas
    await delIn('turmas', 'id', turmas);
    await delIn('disciplinas', 'id_disciplina', disciplinas);
  }
}
