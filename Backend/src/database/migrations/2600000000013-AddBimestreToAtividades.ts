import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBimestreToAtividades2600000000013 implements MigrationInterface {
    name = 'AddBimestreToAtividades2600000000013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`atividades\` ADD \`bimestre\` enum ('1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`atividades\` DROP COLUMN \`bimestre\``);
    }
}