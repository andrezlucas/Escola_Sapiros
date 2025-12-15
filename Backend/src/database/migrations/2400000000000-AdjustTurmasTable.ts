import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AdjustTurmasTable2400000000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remover coluna 'periodo', se existir
        const table = await queryRunner.getTable('turmas');
        if (table?.findColumnByName('periodo')) {
            await queryRunner.dropColumn('turmas', 'periodo');
        }

        // Ajustar colunas de datas com defaults
        if (table?.findColumnByName('criado_em')) {
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
        }

        if (table?.findColumnByName('atualizado_em')) {
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
        }

        // Criar coluna 'turno' caso não exista
        if (!table?.findColumnByName('turno')) {
            await queryRunner.addColumn(
                'turmas',
                new TableColumn({
                    name: 'turno',
                    type: 'varchar',
                    length: '10',
                    isNullable: false,
                    default: `'MANHÃ'`,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recriar coluna 'periodo', caso precise
        const table = await queryRunner.getTable('turmas');
        if (!table?.findColumnByName('periodo')) {
            await queryRunner.addColumn(
                'turmas',
                new TableColumn({
                    name: 'periodo',
                    type: 'varchar',
                    length: '255',
                    isNullable: false,
                }),
            );
        }

        // Restaurar 'turno' sem default
        if (table?.findColumnByName('turno')) {
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
}
