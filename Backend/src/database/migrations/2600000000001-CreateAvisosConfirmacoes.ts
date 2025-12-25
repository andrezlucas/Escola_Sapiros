import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAvisosConfirmacoes2600000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'avisos_confirmacoes',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'aviso_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'usuario_id',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'confirmado_em',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'avisos_confirmacoes',
      new TableForeignKey({
        columnNames: ['aviso_id'],
        referencedTableName: 'avisos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'avisos_confirmacoes',
      new TableForeignKey({
        columnNames: ['usuario_id'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.query(
      `ALTER TABLE avisos_confirmacoes ADD CONSTRAINT UQ_aviso_usuario UNIQUE (aviso_id, usuario_id)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('avisos_confirmacoes');
  }
}
