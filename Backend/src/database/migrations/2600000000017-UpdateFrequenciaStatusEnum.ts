import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFrequenciaStatusEnum2600000000017 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`frequencias\` 
            MODIFY COLUMN \`status\` ENUM('presente', 'falta', 'falta_justificada') 
            NOT NULL DEFAULT 'presente'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`frequencias\` 
            MODIFY COLUMN \`status\` ENUM('presente', 'falta') 
            NOT NULL DEFAULT 'presente'
        `);
    }

}