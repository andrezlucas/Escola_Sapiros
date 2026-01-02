import { MigrationInterface, QueryRunner } from 'typeorm';

export class AjusteOrphans2600000000007 implements MigrationInterface {
  name = 'AjusteOrphans2600000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const fks = await queryRunner.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'alternativas'
        AND COLUMN_NAME = 'questao_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    for (const fk of fks) {
      await queryRunner.query(`
        ALTER TABLE alternativas
        DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\`
      `);
    }

    const fksQuestao = await queryRunner.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'questoes'
        AND COLUMN_NAME = 'atividade_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    for (const fk of fksQuestao) {
      await queryRunner.query(`
        ALTER TABLE questoes
        DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\`
      `);
    }

    await queryRunner.query(`
      ALTER TABLE questoes
      ADD CONSTRAINT FK_questoes_atividade
      FOREIGN KEY (atividade_id)
      REFERENCES atividades(id)
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE alternativas
      ADD CONSTRAINT FK_alternativas_questao
      FOREIGN KEY (questao_id)
      REFERENCES questoes(id)
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE alternativas
      DROP FOREIGN KEY FK_alternativas_questao
    `);

    await queryRunner.query(`
      ALTER TABLE questoes
      DROP FOREIGN KEY FK_questoes_atividade
    `);

    await queryRunner.query(`
      ALTER TABLE questoes
      ADD CONSTRAINT FK_questoes_atividade
      FOREIGN KEY (atividade_id)
      REFERENCES atividades(id)
      ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE alternativas
      ADD CONSTRAINT FK_alternativas_questao
      FOREIGN KEY (questao_id)
      REFERENCES questoes(id)
      ON DELETE RESTRICT
    `);
  }
}
