import { MigrationInterface, QueryRunner } from "typeorm";

export class AjusteConstraintDocumentoFrequencia26120000000002 implements MigrationInterface {
    name = 'AjusteConstraintDocumentoFrequencia26120000000002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove a constraint antiga que causava duplicidade
        await queryRunner.query(`
            ALTER TABLE \`documentos\` 
            DROP INDEX \`UQ_Documento_DocumentacaoId_Tipo\`;
        `);

        // Cria nova constraint única por frequencia + tipo
        await queryRunner.query(`
            ALTER TABLE \`documentos\`
            ADD CONSTRAINT \`UQ_Documento_FrequenciaId_Tipo\` UNIQUE (\`frequencia_id\`, \`tipo\`);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove a nova constraint
        await queryRunner.query(`
            ALTER TABLE \`documentos\`
            DROP INDEX \`UQ_Documento_FrequenciaId_Tipo\`;
        `);

        // Restaura a constraint antiga
        await queryRunner.query(`
            ALTER TABLE \`documentos\`
            ADD CONSTRAINT \`UQ_Documento_DocumentacaoId_Tipo\` UNIQUE (\`documentacao_id\`, \`tipo\`);
        `);
    }
}
