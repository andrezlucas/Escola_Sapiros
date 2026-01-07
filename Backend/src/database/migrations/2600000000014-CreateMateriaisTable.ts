import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMateriaisTable2600000000014 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "materiais",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                    isUnique: true,
                },
                {
                    name: "titulo",
                    type: "varchar",
                    length: "200",
                    isNullable: false,
                },
                {
                    name: "descricao",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "tipo",
                    type: "enum",
                    enum: ["VIDEO", "PDF", "LINK", "OUTRO"], // Ajuste conforme seus Enums
                },
                {
                    name: "origem",
                    type: "enum",
                    enum: ["LOCAL", "URL"],
                },
                {
                    name: "url",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "file_path",
                    type: "varchar",
                    length: "500",
                    isNullable: true,
                },
                {
                    name: "mime_type",
                    type: "varchar",
                    length: "100",
                    isNullable: true,
                },
                {
                    name: "tamanho",
                    type: "int",
                    isNullable: true,
                },
                {
                    name: "professor_id",
                    type: "varchar",
                    length: "36",
                },
                {
                    name: "turma_id",
                    type: "varchar",
                    length: "36",
                    isNullable: true,
                },
                {
                    name: "disciplina_id",
                    type: "varchar",
                    length: "36", // Verifique se sua Disciplina usa id ou id_disciplina
                    isNullable: true,
                },
                {
                    name: "criado_em",
                    type: "timestamp",
                    default: "now()",
                },
                {
                    name: "atualizado_em",
                    type: "timestamp",
                    default: "now()",
                    onUpdate: "now()",
                }
            ]
        }), true);

        await queryRunner.createForeignKeys("materiais", [
            new TableForeignKey({
                columnNames: ["professor_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "professores",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames: ["turma_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "turmas",
                onDelete: "SET NULL"
            }),
            new TableForeignKey({
                columnNames: ["disciplina_id"],
                referencedColumnNames: ["id_disciplina"], // Ajustado para bater com sua entidade Disciplina
                referencedTableName: "disciplinas",
                onDelete: "SET NULL"
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("materiais");
    }
}