import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueAlunoTurmaConstraint1765245999999
  implements MigrationInterface
{
  name = 'AddUniqueAlunoTurmaConstraint1765245999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE alunos_turmas
      ADD CONSTRAINT UQ_ALUNO_TURMA
      UNIQUE (aluno_id, turma_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE alunos_turmas
      DROP INDEX UQ_ALUNO_TURMA;
    `);
  }
}
