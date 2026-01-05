import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class SyncNotasAndAlunos2600000000011 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableNotas = await queryRunner.getTable("notas");
        if (!tableNotas) return;

        // 1. Limpa dados antigos para garantir integridade da FK
        await queryRunner.query("DELETE FROM `notas` text");

        // 2. Remove colunas legadas se existirem
        if (tableNotas.findColumnByName("valor")) await queryRunner.dropColumn("notas", "valor");
        if (tableNotas.findColumnByName("tipo_avaliacao")) await queryRunner.dropColumn("notas", "tipo_avaliacao");
        if (tableNotas.findColumnByName("avaliacao_nome")) await queryRunner.dropColumn("notas", "avaliacao_nome");
        if (tableNotas.findColumnByName("data")) await queryRunner.dropColumn("notas", "data");

        // 3. Adiciona colunas novas APENAS se não existirem
        if (!tableNotas.findColumnByName("nota_1")) {
            await queryRunner.addColumn("notas", new TableColumn({
                name: "nota_1", type: "decimal", precision: 5, scale: 2, default: 0
            }));
        }
        if (!tableNotas.findColumnByName("nota_2")) {
            await queryRunner.addColumn("notas", new TableColumn({
                name: "nota_2", type: "decimal", precision: 5, scale: 2, default: 0
            }));
        }
        if (!tableNotas.findColumnByName("bimestre")) {
            await queryRunner.addColumn("notas", new TableColumn({
                name: "bimestre", type: "enum", enum: ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'], isNullable: false
            }));
        }
        if (!tableNotas.findColumnByName("professor_id")) {
            await queryRunner.addColumn("notas", new TableColumn({
                name: "professor_id", type: "char(36)", isNullable: false
            }));
        }

        // 4. Cria a Foreign Key (Verifica se já existe para não duplicar)
        const foreignKey = tableNotas.foreignKeys.find(fk => fk.name === "FK_nota_professor");
        if (!foreignKey) {
            await queryRunner.createForeignKey("notas", new TableForeignKey({
                name: "FK_nota_professor",
                columnNames: ["professor_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "professores",
                onDelete: "CASCADE"
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("notas");
        if (table) {
            const foreignKey = table.foreignKeys.find(fk => fk.name === "FK_nota_professor");
            if (foreignKey) await queryRunner.dropForeignKey("notas", foreignKey);
            
            const columns = ["nota_1", "nota_2", "bimestre", "professor_id"];
            for (const col of columns) {
                if (table.findColumnByName(col)) await queryRunner.dropColumn("notas", col);
            }
        }
    }
}