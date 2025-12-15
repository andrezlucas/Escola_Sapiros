import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateTurmasRelations2300000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Atualiza tabela turmas ---
    const table = await queryRunner.getTable('turmas');

    // Coluna turno
    if (!table?.findColumnByName('turno')) {
      await queryRunner.query(
        `ALTER TABLE turmas ADD COLUMN turno VARCHAR(10) NOT NULL DEFAULT 'MANHÃ';`,
      );
    }

    // Coluna capacidade_maxima
    if (!table?.findColumnByName('capacidade_maxima')) {
      await queryRunner.query(
        `ALTER TABLE turmas ADD COLUMN capacidade_maxima INT NOT NULL DEFAULT 0;`,
      );
    }

    // --- Cria tabela de relacionamento turma_disciplinas ---
    const hasTurmaDisciplinas = await queryRunner.hasTable('turma_disciplinas');
    if (!hasTurmaDisciplinas) {
      await queryRunner.createTable(
        new Table({
          name: 'turma_disciplinas',
          columns: [
            { name: 'turma_id', type: 'char', length: '36', isPrimary: true },
            { name: 'disciplina_id', type: 'char', length: '36', isPrimary: true },
          ],
        }),
        true,
      );

      await queryRunner.createForeignKey(
        'turma_disciplinas',
        new TableForeignKey({
          columnNames: ['turma_id'],
          referencedTableName: 'turmas',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );

      await queryRunner.createForeignKey(
        'turma_disciplinas',
        new TableForeignKey({
          columnNames: ['disciplina_id'],
          referencedTableName: 'disciplinas',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }

    // --- Cria tabela de relacionamento turma_alunos ---
    const hasTurmaAlunos = await queryRunner.hasTable('turma_alunos');
    if (!hasTurmaAlunos) {
      await queryRunner.createTable(
        new Table({
          name: 'turma_alunos',
          columns: [
            { name: 'turma_id', type: 'char', length: '36', isPrimary: true },
            { name: 'aluno_id', type: 'char', length: '36', isPrimary: true },
          ],
        }),
        true,
      );

      await queryRunner.createForeignKey(
        'turma_alunos',
        new TableForeignKey({
          columnNames: ['turma_id'],
          referencedTableName: 'turmas',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );

      await queryRunner.createForeignKey(
        'turma_alunos',
        new TableForeignKey({
          columnNames: ['aluno_id'],
          referencedTableName: 'usuarios',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop relacionamento turma_alunos
    if (await queryRunner.hasTable('turma_alunos')) {
      await queryRunner.dropTable('turma_alunos');
    }

    // Drop relacionamento turma_disciplinas
    if (await queryRunner.hasTable('turma_disciplinas')) {
      await queryRunner.dropTable('turma_disciplinas');
    }

    // Remover coluna turno se existir
    const table = await queryRunner.getTable('turmas');
    if (table?.findColumnByName('turno')) {
      await queryRunner.query(`ALTER TABLE turmas DROP COLUMN turno;`);
    }

    // Remover coluna capacidade_maxima se existir
    if (table?.findColumnByName('capacidade_maxima')) {
      await queryRunner.query(`ALTER TABLE turmas DROP COLUMN capacidade_maxima;`);
    }
  }
}
