import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsBlockedDefaultToUsuarios2099999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Garante que a coluna existe e define DEFAULT 0
    await queryRunner.query(`
      ALTER TABLE usuarios
      MODIFY COLUMN is_blocked TINYINT(1) NOT NULL DEFAULT 0;
    `);

    // Atualiza registros existentes que estão NULL para 0
    await queryRunner.query(`
      UPDATE usuarios
      SET is_blocked = 0
      WHERE is_blocked IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverte para permitir NULL
    await queryRunner.query(`
      ALTER TABLE usuarios
      MODIFY COLUMN is_blocked TINYINT(1) NULL;
    `);
  }
}
