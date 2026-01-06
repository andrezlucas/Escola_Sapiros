import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNotasStructureWithDataMigration2600000000012 implements MigrationInterface {
    name = 'UpdateNotasStructureWithDataMigration2600000000012'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notas\` ADD \`habilidades_1\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`notas\` ADD \`feedback_1\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`notas\` ADD \`habilidades_2\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`notas\` ADD \`feedback_2\` text NULL`);

        await queryRunner.query(`UPDATE \`notas\` SET \`feedback_1\` = \`feedback\`, \`habilidades_1\` = \`habilidades\``);

        await queryRunner.query(`ALTER TABLE \`notas\` DROP COLUMN \`feedback\``);
        await queryRunner.query(`ALTER TABLE \`notas\` DROP COLUMN \`habilidades\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`notas\` ADD \`habilidades\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`notas\` ADD \`feedback\` text NULL`);

        await queryRunner.query(`UPDATE \`notas\` SET \`feedback\` = \`feedback_1\`, \`habilidades\` = \`habilidades_1\``);

        await queryRunner.query(`ALTER TABLE \`notas\` DROP COLUMN \`feedback_2\``);
        await queryRunner.query(`ALTER TABLE \`notas\` DROP COLUMN \`habilidades_2\``);
        await queryRunner.query(`ALTER TABLE \`notas\` DROP COLUMN \`feedback_1\``);
        await queryRunner.query(`ALTER TABLE \`notas\` DROP COLUMN \`habilidades_1\``);
    }
}