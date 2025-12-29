import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class MoveHabilidadeToQuestao2600000000005
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS atividades_habilidades
    `);

    await queryRunner.createTable(
      new Table({
        name: 'questoes_habilidades',
        columns: [
          {
            name: 'questao_id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'habilidade_id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
        ],
        engine: 'InnoDB',
      }),
    );

    await queryRunner.createForeignKey(
      'questoes_habilidades',
      new TableForeignKey({
        columnNames: ['questao_id'],
        referencedTableName: 'questoes',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'questoes_habilidades',
      new TableForeignKey({
        columnNames: ['habilidade_id'],
        referencedTableName: 'habilidades',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('questoes_habilidades');

    await queryRunner.createTable(
      new Table({
        name: 'atividades_habilidades',
        columns: [
          {
            name: 'atividade_id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'habilidade_id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
        ],
        engine: 'InnoDB',
      }),
    );

    await queryRunner.createForeignKey(
      'atividades_habilidades',
      new TableForeignKey({
        columnNames: ['atividade_id'],
        referencedTableName: 'atividades',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'atividades_habilidades',
      new TableForeignKey({
        columnNames: ['habilidade_id'],
        referencedTableName: 'habilidades',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }
}
