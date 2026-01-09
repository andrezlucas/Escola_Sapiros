import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTurmaRelationToFrequencia2600000000008 implements MigrationInterface {
  name = 'AddTurmaRelationToFrequencia2600000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Garante que a tabela existe
    const hasTable = await queryRunner.hasTable('frequencias');
    if (!hasTable) {
      throw new Error('Tabela frequencias não existe. Execute migrations anteriores primeiro.');
    }

    // Remove colunas antigas (se existirem)
    const hasPresente = await queryRunner.hasColumn('frequencias', 'presente');
    if (hasPresente) {
      await queryRunner.query(`
        ALTER TABLE frequencias DROP COLUMN presente
      `);
    }

    const hasObservacao = await queryRunner.hasColumn('frequencias', 'observacao');
    if (hasObservacao) {
      await queryRunner.query(`
        ALTER TABLE frequencias DROP COLUMN observacao
      `);
    }

    // Adiciona coluna status
    const hasStatus = await queryRunner.hasColumn('frequencias', 'status');
    if (!hasStatus) {
      await queryRunner.query(`
        ALTER TABLE frequencias
        ADD COLUMN status ENUM('presente','falta','falta_justificada')
        NOT NULL DEFAULT 'presente'
        AFTER data
      `);
    }

    // Adiciona coluna faltasNoPeriodo
    const hasFaltas = await queryRunner.hasColumn('frequencias', 'faltasNoPeriodo');
    if (!hasFaltas) {
      await queryRunner.query(`
        ALTER TABLE frequencias
        ADD COLUMN faltasNoPeriodo INT NOT NULL DEFAULT 0
        AFTER status
      `);
    }

    // Adiciona coluna justificativa
    const hasJustificativa = await queryRunner.hasColumn('frequencias', 'justificativa');
    if (!hasJustificativa) {
      await queryRunner.query(`
        ALTER TABLE frequencias
        ADD COLUMN justificativa TEXT NULL
        AFTER faltasNoPeriodo
      `);
    }

    // ===== RELAÇÃO COM TURMA =====
    const hasTurma = await queryRunner.hasColumn('frequencias', 'turma_id');
    if (!hasTurma) {
      await queryRunner.query(`
        ALTER TABLE frequencias
        ADD COLUMN turma_id CHAR(36) NOT NULL
      `);

      await queryRunner.query(`
        ALTER TABLE frequencias
        ADD CONSTRAINT FK_Frequencia_Turma
        FOREIGN KEY (turma_id) REFERENCES turmas(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove FK e coluna turma_id
    const hasTurma = await queryRunner.hasColumn('frequencias', 'turma_id');
    if (hasTurma) {
      await queryRunner.query(`
        ALTER TABLE frequencias DROP FOREIGN KEY FK_Frequencia_Turma
      `);

      await queryRunner.query(`
        ALTER TABLE frequencias DROP COLUMN turma_id
      `);
    }

    // Remove novas colunas
    const hasJustificativa = await queryRunner.hasColumn('frequencias', 'justificativa');
    if (hasJustificativa) {
      await queryRunner.query(`
        ALTER TABLE frequencias DROP COLUMN justificativa
      `);
    }

    const hasFaltas = await queryRunner.hasColumn('frequencias', 'faltasNoPeriodo');
    if (hasFaltas) {
      await queryRunner.query(`
        ALTER TABLE frequencias DROP COLUMN faltasNoPeriodo
      `);
    }

    const hasStatus = await queryRunner.hasColumn('frequencias', 'status');
    if (hasStatus) {
      await queryRunner.query(`
        ALTER TABLE frequencias DROP COLUMN status
      `);
    }

    // Recria colunas antigas
    await queryRunner.query(`
      ALTER TABLE frequencias
      ADD COLUMN presente TINYINT(1) DEFAULT 0 AFTER data
    `);

    await queryRunner.query(`
      ALTER TABLE frequencias
      ADD COLUMN observacao TEXT NULL AFTER presente
    `);
  }
}
