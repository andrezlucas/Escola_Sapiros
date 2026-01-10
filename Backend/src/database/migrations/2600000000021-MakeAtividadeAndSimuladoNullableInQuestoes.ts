import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class MakeAtividadeAndSimuladoNullableInQuestoes2600000000021 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableName = "questoes";
        const table = await queryRunner.getTable(tableName);

        // 1. Remover FKs se existirem (para permitir o MODIFY)
        const fkAtividade = table?.foreignKeys.find(fk => fk.columnNames.includes("atividade_id"));
        const fkSimulado = table?.foreignKeys.find(fk => fk.columnNames.includes("simulado_id"));

        if (fkAtividade) await queryRunner.dropForeignKey(tableName, fkAtividade);
        if (fkSimulado) await queryRunner.dropForeignKey(tableName, fkSimulado);

        // 2. Alterar colunas para aceitar NULL
        await queryRunner.query(`ALTER TABLE questoes MODIFY atividade_id varchar(255) NULL;`);
        await queryRunner.query(`ALTER TABLE questoes MODIFY simulado_id varchar(255) NULL;`);

        // 3. Recriar FK de Atividade
        await queryRunner.createForeignKey(tableName, new TableForeignKey({
            name: "FK_questoes_atividade",
            columnNames: ["atividade_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "atividades",
            onDelete: "CASCADE"
        }));

        // 4. Recriar FK de Simulado
        await queryRunner.createForeignKey(tableName, new TableForeignKey({
            name: "FK_questao_simulado",
            columnNames: ["simulado_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "simulados",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // No down, fazemos o inverso (opcional, mas boa prática)
        await queryRunner.query(`ALTER TABLE questoes MODIFY atividade_id varchar(255) NOT NULL;`);
        await queryRunner.query(`ALTER TABLE questoes MODIFY simulado_id varchar(255) NOT NULL;`);
    }
}