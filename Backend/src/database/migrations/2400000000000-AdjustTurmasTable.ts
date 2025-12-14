import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AdjustTurmasTable2400000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remover coluna periodo
        await queryRunner.dropColumn('turmas', 'periodo');

        // Ajustar nome das colunas de datas e defaults
        await queryRunner.changeColumn(
            'turmas',
            'criado_em',
            new TableColumn({
                name: 'criado_em',
                type: 'timestamp',
                isNullable: true,
                default: 'CURRENT_TIMESTAMP',
            }),
        );

        await queryRunner.changeColumn(
            'turmas',
            'atualizado_em',
            new TableColumn({
                name: 'atualizado_em',
                type: 'timestamp',
                isNullable: true,
                default: 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
            }),
        );

        // Ajustar valor default de turno, caso deseje
        await queryRunner.changeColumn(
            'turmas',
            'turno',
            new TableColumn({
                name: 'turno',
                type: 'varchar',
                length: '10',
                isNullable: false,
                default: `'MANHÃ'`,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recriar coluna periodo caso seja necessário rollback
        await queryRunner.addColumn(
            'turmas',
            new TableColumn({
                name: 'periodo',
                type: 'varchar',
                length: '255',
                isNullable: false,
            }),
        );

        // Restaurar defaults anteriores
        await queryRunner.changeColumn(
            'turmas',
            'turno',
            new TableColumn({
                name: 'turno',
                type: 'varchar',
                length: '10',
                isNullable: false,
            }),
        );
    }
}
