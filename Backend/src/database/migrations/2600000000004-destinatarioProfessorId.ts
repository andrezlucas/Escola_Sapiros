import { MigrationInterface, QueryRunner, TableColumn, Table } from 'typeorm';

export class DestinatarioProfessorId2600000000004 implements MigrationInterface {
  name = 'DestinatarioProfessorId2600000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================
    // ALTERAÇÃO DA TABELA AVISOS
    // ============================
    const avisosTable: Table | undefined = await queryRunner.getTable('avisos');

    if (avisosTable) {
      const column = new TableColumn({
        name: 'destinatario_professor_id',
        type: 'char',
        length: '36',
        isNullable: true,
      });

      if (!avisosTable.columns.find(c => c.name === column.name)) {
        await queryRunner.addColumn('avisos', column);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const avisosTable = await queryRunner.getTable('avisos');

    if (
      avisosTable &&
      avisosTable.columns.find(c => c.name === 'destinatario_professor_id')
    ) {
      await queryRunner.dropColumn('avisos', 'destinatario_professor_id');
    }
  }
}
