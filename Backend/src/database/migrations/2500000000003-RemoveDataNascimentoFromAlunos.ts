import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDataNascimentoFromAlunos2500000000003
  implements MigrationInterface
{
  name = 'RemoveDataNascimentoFromAlunos2500000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE alunos
      DROP COLUMN data_nascimento
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE alunos
      ADD data_nascimento DATE NOT NULL
    `);
  }
}
