import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDisciplinaAndCreateHabilidades1899999999999 implements MigrationInterface {
  name = 'UpdateDisciplinaAndCreateHabilidades1899999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const disciplinasTable = await queryRunner.getTable('disciplinas');

    if (disciplinasTable) {
      // Ajustes na tabela disciplinas
      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE id id_disciplina CHAR(36) NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE codigo codigo_disciplina VARCHAR(255) NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE carga_horaria cargaHoraria INT NOT NULL
      `);

      // Remover coluna descricao antiga se existir
      if (disciplinasTable.findColumnByName('descricao')) {
        await queryRunner.query(`
          ALTER TABLE disciplinas
          DROP COLUMN descricao
        `);
      }

      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE criado_em disciplinacriadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE atualizado_em disciplinaatualizadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
    }

    // Criar tabela habilidades (somente se não existir)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS habilidades (
        id CHAR(36) NOT NULL,
        disciplina_id CHAR(36) NOT NULL,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT NULL,
        criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_HABILIDADE_DISCIPLINA
          FOREIGN KEY (disciplina_id)
          REFERENCES disciplinas(id_disciplina)
          ON DELETE CASCADE,
        CONSTRAINT UQ_HABILIDADE_DISCIPLINA
          UNIQUE (disciplina_id, nome)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter criação de habilidades
    await queryRunner.query(`DROP TABLE IF EXISTS habilidades`);

    const disciplinasTable = await queryRunner.getTable('disciplinas');

    if (disciplinasTable) {
      // Reverter ajustes da tabela disciplinas
      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE id_disciplina id CHAR(36) NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE codigo_disciplina codigo VARCHAR(255) NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE cargaHoraria carga_horaria INT NOT NULL
      `);

      // Recriar coluna descricao se não existir
      if (!disciplinasTable.findColumnByName('descricao')) {
        await queryRunner.query(`
          ALTER TABLE disciplinas
          ADD descricao TEXT
        `);
      }

      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE disciplinacriadoEm criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      await queryRunner.query(`
        ALTER TABLE disciplinas
        CHANGE disciplinaatualizadoEm atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
    }
  }
}
