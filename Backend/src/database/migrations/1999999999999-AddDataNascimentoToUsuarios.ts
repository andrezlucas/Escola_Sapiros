import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataNascimentoToUsuarios1999999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1️Adiciona coluna data_nascimento como NULL inicialmente
    await queryRunner.query(`
      ALTER TABLE usuarios
      ADD COLUMN data_nascimento DATE NULL AFTER nome;
    `);

    // 2 Atualiza registros existentes com uma data padrão
    await queryRunner.query(`
      UPDATE usuarios
      SET data_nascimento = '2000-01-01'
      WHERE data_nascimento IS NULL;
    `);

    // 3️ Agora torna data_nascimento NOT NULL
    await queryRunner.query(`
      ALTER TABLE usuarios
      MODIFY COLUMN data_nascimento DATE NOT NULL;
    `);

    // 4️ Adiciona coluna telefone como NULL
    await queryRunner.query(`
      ALTER TABLE usuarios
      ADD COLUMN telefone VARCHAR(20) NULL AFTER data_nascimento;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove telefone e data_nascimento
    await queryRunner.query(`
      ALTER TABLE usuarios
      DROP COLUMN telefone;
    `);

    await queryRunner.query(`
      ALTER TABLE usuarios
      DROP COLUMN data_nascimento;
    `);
  }
}
