import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSimuladoTables2600000000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'simulados',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            default: '(UUID())',
          },
          {
            name: 'versao',
            type: 'int',
            default: 1,
          },
          {
            name: 'titulo',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'descricao',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'bimestre',
            type: 'enum',
            enum: ['PRIMEIRO', 'SEGUNDO', 'TERCEIRO', 'QUARTO'],
            isNullable: false,
          },
          {
            name: 'data_inicio',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'data_fim',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'tempo_duracao',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'inicio_da_prova',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'valor_total',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'ativo',
            type: 'boolean',
            default: true,
          },
          {
            name: 'professor_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'disciplina_id',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'criado_em',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'atualizado_em',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'simulados_turmas',
        columns: [
          {
            name: 'simulado_id',
            type: 'varchar',
            isPrimary: true,
          },
          {
            name: 'turma_id',
            type: 'varchar',
            isPrimary: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKeys('simulados', [
      new TableForeignKey({
        columnNames: ['professor_id'],
        referencedTableName: 'professores',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['disciplina_id'],
        referencedTableName: 'disciplinas',
        referencedColumnNames: ['id_disciplina'], // ✅ CORREÇÃO
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    ]);

    await queryRunner.createForeignKeys('simulados_turmas', [
      new TableForeignKey({
        columnNames: ['simulado_id'],
        referencedTableName: 'simulados',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['turma_id'],
        referencedTableName: 'turmas',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('simulados_turmas');
    await queryRunner.dropTable('simulados');
  }
}
