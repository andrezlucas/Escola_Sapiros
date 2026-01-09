import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSimuladoToQuestao2600000000019 implements MigrationInterface {
  name = 'AddSimuladoToQuestao2600000000019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE questoes
      ADD COLUMN simulado_id CHAR(36) NULL
    `);

    await queryRunner.query(`
      ALTER TABLE questoes
      ADD CONSTRAINT FK_questao_simulado
      FOREIGN KEY (simulado_id)
      REFERENCES simulados(id)
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE questoes DROP FOREIGN KEY FK_questao_simulado
    `);

    await queryRunner.query(`
      ALTER TABLE questoes DROP COLUMN simulado_id
    `);
  }
}
