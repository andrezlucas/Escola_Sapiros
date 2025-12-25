import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoriaToAvisos2600000000002   implements MigrationInterface {
  name = 'AddCategoriaToAvisos2600000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE avisos
      ADD COLUMN categoria ENUM(
        'ACADEMICO',
        'SECRETARIA',
        'EVENTO',
        'URGENTE',
        'FERIADO',
        'TECNOLOGIA'
      ) NOT NULL
      AFTER tipo
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE avisos DROP COLUMN categoria
    `);
  }
}
