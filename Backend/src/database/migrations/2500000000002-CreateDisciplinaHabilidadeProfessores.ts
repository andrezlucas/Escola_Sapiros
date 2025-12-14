import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDisciplinaHabilidadeProfessores2500000000002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cria tabela professores_disciplinas
        await queryRunner.createTable(
            new Table({
                name: "professores_disciplinas",
                columns: [
                    { name: "professor_id", type: "char", length: "36", isPrimary: true },
                    { name: "disciplina_id", type: "char", length: "36", isPrimary: true },
                ],
                engine: "InnoDB",
            }),
            true
        );

        // Cria FK para disciplina_id na tabela professores_disciplinas
        await queryRunner.createForeignKey(
            "professores_disciplinas",
            new TableForeignKey({
                name: "FK_professores_disciplinas_disciplina",
                columnNames: ["disciplina_id"],
                referencedColumnNames: ["id_disciplina"],
                referencedTableName: "disciplinas",
                onDelete: "CASCADE",
            })
        );

        // Cria FK para professor_id na tabela professores_disciplinas
        await queryRunner.createForeignKey(
            "professores_disciplinas",
            new TableForeignKey({
                name: "FK_professores_disciplinas_professor",
                columnNames: ["professor_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "professores",
                onDelete: "CASCADE",
            })
        );

        // Cria FK disciplina_id na tabela habilidades (se ainda não existir)
        const habilidadesTable = await queryRunner.getTable("habilidades");
        if (habilidadesTable && !habilidadesTable.foreignKeys.find(fk => fk.name === "FK_habilidades_disciplina")) {
            await queryRunner.createForeignKey(
                "habilidades",
                new TableForeignKey({
                    name: "FK_habilidades_disciplina",
                    columnNames: ["disciplina_id"],
                    referencedColumnNames: ["id_disciplina"],
                    referencedTableName: "disciplinas",
                    onDelete: "CASCADE",
                })
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove FKs da tabela professores_disciplinas
        const professoresDisciplinasTable = await queryRunner.getTable("professores_disciplinas");
        if (professoresDisciplinasTable) {
            for (const fk of professoresDisciplinasTable.foreignKeys) {
                await queryRunner.dropForeignKey("professores_disciplinas", fk);
            }
        }

        // Remove FK da tabela habilidades
        const habilidadesTable = await queryRunner.getTable("habilidades");
        if (habilidadesTable) {
            const fk = habilidadesTable.foreignKeys.find(fk => fk.name === "FK_habilidades_disciplina");
            if (fk) await queryRunner.dropForeignKey("habilidades", fk);
        }

        // Remove tabela professores_disciplinas
        await queryRunner.dropTable("professores_disciplinas");
    }
}
