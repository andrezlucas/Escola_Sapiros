import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFormaEntregaEnum26120000000005 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Primeiro, garantimos que não existam registros com o valor que será removido
        // Vamos mover 'correios' para 'presencial' como fallback
        await queryRunner.query(`
            UPDATE solicitacoes_documentos 
            SET formaEntrega = 'presencial' 
            WHERE formaEntrega = 'correios'
        `);

        // 2. Alteramos a coluna para o novo conjunto de ENUM (sem 'correios')
        await queryRunner.query(`
            ALTER TABLE solicitacoes_documentos 
            MODIFY COLUMN formaEntrega ENUM('presencial', 'email') NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Para reverter, voltamos a coluna a aceitar o valor 'correios'
        await queryRunner.query(`
            ALTER TABLE solicitacoes_documentos 
            MODIFY COLUMN formaEntrega ENUM('presencial', 'email', 'correios') NOT NULL
        `);
    }
}