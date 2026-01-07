import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFrequenciasTableAddStatusAndFaltas1704600000000 implements MigrationInterface {
  name = 'UpdateFrequenciasTableAddStatusAndFaltas1704600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verifica se a tabela existe
    const hasTable = await queryRunner.hasTable('frequencias');
    if (!hasTable) {
      throw new Error('Tabela frequencias não existe. Execute migrations anteriores primeiro.');
    }

    // Remove colunas antigas se existirem
    const hasPresente = await queryRunner.hasColumn('frequencias', 'presente');
    if (hasPresente) {
      await queryRunner.query(`ALTER TABLE frequencias DROP COLUMN presente`);
    }

    const hasObservacao = await queryRunner.hasColumn('frequencias', 'observacao');
    if (hasObservacao) {
      await queryRunner.query(`ALTER TABLE frequencias DROP COLUMN observacao`);
    }

    // Adiciona coluna status (enum)
    const hasStatus = await queryRunner.hasColumn('frequencias', 'status');
    if (!hasStatus) {
      await queryRunner.query(`
        ALTER TABLE frequencias 
        ADD COLUMN status ENUM('presente','falta','falta_justificada') NOT NULL DEFAULT 'presente' AFTER data
      `);
    }

    // Adiciona coluna faltasNoPeriodo
    const hasFaltas = await queryRunner.hasColumn('frequencias', 'faltasNoPeriodo');
    if (!hasFaltas) {
      await queryRunner.query(`
        ALTER TABLE frequencias 
        ADD COLUMN faltasNoPeriodo INT NOT NULL DEFAULT 0 AFTER status
      `);
    }

    // Adiciona coluna justificativa
    const hasJustificativa = await queryRunner.hasColumn('frequencias', 'justificativa');
    if (!hasJustificativa) {
      await queryRunner.query(`
        ALTER TABLE frequencias 
        ADD COLUMN justificativa TEXT NULL AFTER faltasNoPeriodo
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove novas colunas
    const hasStatus = await queryRunner.hasColumn('frequencias', 'status');
    if (hasStatus) {
      await queryRunner.query(`ALTER TABLE frequencias DROP COLUMN status`);
    }

    const hasFaltas = await queryRunner.hasColumn('frequencias', 'faltasNoPeriodo');
    if (hasFaltas) {
      await queryRunner.query(`ALTER TABLE frequencias DROP COLUMN faltasNoPeriodo`);
    }

    const hasJustificativa = await queryRunner.hasColumn('frequencias', 'justificativa');
    if (hasJustificativa) {
      await queryRunner.query(`ALTER TABLE frequencias DROP COLUMN justificativa`);
    }

    // Recria colunas antigas para rollback
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
