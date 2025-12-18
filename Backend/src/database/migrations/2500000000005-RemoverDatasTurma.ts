import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoverDatasTurma2500000000005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove as colunas data_inicio e data_fim
        await queryRunner.dropColumn("turmas", "data_inicio");
        await queryRunner.dropColumn("turmas", "data_fim");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Caso precise reverter, elas serão recriadas
        await queryRunner.addColumn(
            "turmas",
            new TableColumn({
                name: "data_inicio",
                type: "date",
                isNullable: true, // na reversão colocamos true para não quebrar dados existentes
            })
        );
        await queryRunner.addColumn(
            "turmas",
            new TableColumn({
                name: "data_fim",
                type: "date",
                isNullable: true,
            })
        );
    }
}