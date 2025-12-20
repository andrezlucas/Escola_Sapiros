import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlunoUmaTurma2500000000006 implements MigrationInterface {
  name = 'AlunoUmaTurma2500000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      ALTER TABLE alunos
      ADD COLUMN turma_id CHAR(36) NULL
    `);

 
    await queryRunner.query(`
      UPDATE alunos a
      JOIN turma_alunos ta ON ta.aluno_id = a.id
      SET a.turma_id = ta.turma_id
      WHERE a.turma_id IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE alunos
      ADD CONSTRAINT fk_aluno_turma
      FOREIGN KEY (turma_id)
      REFERENCES turmas(id)
      ON DELETE SET NULL
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS alunos_turmas`);
    await queryRunner.query(`DROP TABLE IF EXISTS turma_alunos`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`
      CREATE TABLE turma_alunos (
        turma_id CHAR(36) NOT NULL,
        aluno_id CHAR(36) NOT NULL,
        PRIMARY KEY (turma_id, aluno_id)
      )
    `);

    await queryRunner.query(`
      ALTER TABLE alunos
      DROP FOREIGN KEY fk_aluno_turma
    `);

  
    await queryRunner.query(`
      ALTER TABLE alunos
      DROP COLUMN turma_id
    `);
  }
}
