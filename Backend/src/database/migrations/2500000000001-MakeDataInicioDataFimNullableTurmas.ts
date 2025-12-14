import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class MakeDataInicioDataFimNullableTurmas2500000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Altera data_inicio para nullable
        await queryRunner.changeColumn('turmas', 'data_inicio', new TableColumn({
            name: 'data_inicio',
            type: 'date',
            isNullable: true,
        }));

        // Altera data_fim para nullable (caso não esteja)
        await queryRunner.changeColumn('turmas', 'data_fim', new TableColumn({
            name: 'data_fim',
            type: 'date',
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverte alterações para não nullable
        await queryRunner.changeColumn('turmas', 'data_inicio', new TableColumn({
            name: 'data_inicio',
            type: 'date',
            isNullable: false,
        }));

        await queryRunner.changeColumn('turmas', 'data_fim', new TableColumn({
            name: 'data_fim',
            type: 'date',
            isNullable: false,
        }));
    }
}
