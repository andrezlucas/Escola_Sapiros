import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddStatusToFrequencias2600000000010 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "frequencias",
            new TableColumn({
                name: "status",
                type: "enum",
                // Os valores devem bater exatamente com o seu StatusFrequencia enum
                enum: ['presente', 'falta', 'falta_justificada'], 
                default: "'presente'", // MySQL exige aspas simples para literais de string
                isNullable: false
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("frequencias", "status");
    }

}