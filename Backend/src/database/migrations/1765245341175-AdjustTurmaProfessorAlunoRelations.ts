import { MigrationInterface, QueryRunner, TableIndex, TableForeignKey } from 'typeorm';

export class AdjustTurmaProfessorAlunoRelations1765245341175
  implements MigrationInterface
{
  name = 'AdjustTurmaProfessorAlunoRelations1765245341175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ======== Criação de índices ========
    const turmasTable = await queryRunner.getTable('turmas');
    if (turmasTable && !turmasTable.indices.find(idx => idx.name === 'IDX_TURMA_PROFESSOR')) {
      await queryRunner.createIndex(
        'turmas',
        new TableIndex({
          name: 'IDX_TURMA_PROFESSOR',
          columnNames: ['professor_id'],
        })
      );
    }

    const alunosTurmasTable = await queryRunner.getTable('alunos_turmas');
    if (alunosTurmasTable) {
      if (!alunosTurmasTable.indices.find(idx => idx.name === 'IDX_ALUNO_TURMA_ALUNO')) {
        await queryRunner.createIndex(
          'alunos_turmas',
          new TableIndex({
            name: 'IDX_ALUNO_TURMA_ALUNO',
            columnNames: ['aluno_id'],
          })
        );
      }
      if (!alunosTurmasTable.indices.find(idx => idx.name === 'IDX_ALUNO_TURMA_TURMA')) {
        await queryRunner.createIndex(
          'alunos_turmas',
          new TableIndex({
            name: 'IDX_ALUNO_TURMA_TURMA',
            columnNames: ['turma_id'],
          })
        );
      }
    }

    // ======== Ajuste de foreign keys ========
    if (alunosTurmasTable) {
      const fkTurma = alunosTurmasTable.foreignKeys.find(fk => fk.name === 'FK_AlunoTurma_Turma');
      if (!fkTurma) {
        await queryRunner.createForeignKey(
          'alunos_turmas',
          new TableForeignKey({
            name: 'FK_AlunoTurma_Turma',
            columnNames: ['turma_id'],
            referencedTableName: 'turmas',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          })
        );
      }

      const fkAluno = alunosTurmasTable.foreignKeys.find(fk => fk.name === 'FK_AlunoTurma_Aluno');
      if (!fkAluno) {
        await queryRunner.createForeignKey(
          'alunos_turmas',
          new TableForeignKey({
            name: 'FK_AlunoTurma_Aluno',
            columnNames: ['aluno_id'],
            referencedTableName: 'alunos',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          })
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const alunosTurmasTable = await queryRunner.getTable('alunos_turmas');
    if (alunosTurmasTable) {
      const fkTurma = alunosTurmasTable.foreignKeys.find(fk => fk.name === 'FK_AlunoTurma_Turma');
      if (fkTurma) {
        await queryRunner.dropForeignKey('alunos_turmas', fkTurma);
      }

      const fkAluno = alunosTurmasTable.foreignKeys.find(fk => fk.name === 'FK_AlunoTurma_Aluno');
      if (fkAluno) {
        await queryRunner.dropForeignKey('alunos_turmas', fkAluno);
      }
    }

    const turmasTable = await queryRunner.getTable('turmas');
    if (turmasTable) {
      const idxTurma = turmasTable.indices.find(idx => idx.name === 'IDX_TURMA_PROFESSOR');
      if (idxTurma) {
        await queryRunner.dropIndex('turmas', idxTurma);
      }
    }

    if (alunosTurmasTable) {
      const idxAluno = alunosTurmasTable.indices.find(idx => idx.name === 'IDX_ALUNO_TURMA_ALUNO');
      if (idxAluno) {
        await queryRunner.dropIndex('alunos_turmas', idxAluno);
      }
      const idxTurmaAluno = alunosTurmasTable.indices.find(idx => idx.name === 'IDX_ALUNO_TURMA_TURMA');
      if (idxTurmaAluno) {
        await queryRunner.dropIndex('alunos_turmas', idxTurmaAluno);
      }
    }
  }
}
