import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAuditLogsTable26120000000006 implements MigrationInterface {
  name = 'CreateAuditLogsTable26120000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            isUnique: true,
          },
          {
            name: 'usuario_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'usuario_nome',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'usuario_role',
            type: 'enum',
            enum: ['aluno', 'professor', 'coordenacao'],
            isNullable: true,
          },
          {
            name: 'acao',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'entidade',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'entidade_id',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'descricao',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'json',
            isNullable: true,
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'criado_em',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndices('audit_logs', [
      new TableIndex({
        name: 'IDX_audit_logs_criado_em',
        columnNames: ['criado_em'],
      }),
      new TableIndex({
        name: 'IDX_audit_logs_usuario_id',
        columnNames: ['usuario_id'],
      }),
      new TableIndex({
        name: 'IDX_audit_logs_acao',
        columnNames: ['acao'],
      }),
      new TableIndex({
        name: 'IDX_audit_logs_entidade_entidade_id',
        columnNames: ['entidade', 'entidade_id'],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
  }
}
