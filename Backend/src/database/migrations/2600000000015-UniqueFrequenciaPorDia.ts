import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueFrequenciaPorDia2600000000015
  implements MigrationInterface
{
  name = 'UniqueFrequenciaPorDia2600000000015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE frequencias
      ADD UNIQUE INDEX UQ_frequencia_unica_por_dia
      (aluno_id, disciplina_id, turma_id, data)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE frequencias
      DROP INDEX UQ_frequencia_unica_por_dia
    `);
  }
}
