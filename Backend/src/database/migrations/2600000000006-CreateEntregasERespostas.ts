import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateEntregasERespostas2600000000006 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "entregas_atividades",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                },
                {
                    name: "aluno_id",
                    type: "varchar",
                    length: "36",
                    isNullable: false,
                },
                {
                    name: "atividade_id",
                    type: "varchar",
                    length: "36",
                    isNullable: false,
                },
                {
                    name: "notaFinal",
                    type: "decimal",
                    precision: 5,
                    scale: 2,
                    default: 0,
                },
                {
                    name: "data_entrega",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                }
            ]
        }), true);

        await queryRunner.createTable(new Table({
            name: "respostas_questoes",
            columns: [
                {
                    name: "id",
                    type: "varchar",
                    length: "36",
                    isPrimary: true,
                },
                {
                    name: "entrega_id",
                    type: "varchar",
                    length: "36",
                    isNullable: false,
                },
                {
                    name: "questao_id",
                    type: "varchar",
                    length: "36",
                    isNullable: false,
                },
                {
                    name: "alternativa_id",
                    type: "varchar",
                    length: "36",
                    isNullable: true,
                },
                {
                    name: "textoResposta",
                    type: "text",
                    isNullable: true,
                },
                {
                    name: "notaAtribuida",
                    type: "decimal",
                    precision: 5,
                    scale: 2,
                    default: 0,
                }
            ]
        }), true);

        await queryRunner.createForeignKeys("entregas_atividades", [
            new TableForeignKey({
                columnNames: ["aluno_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "alunos",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames: ["atividade_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "atividades",
                onDelete: "CASCADE"
            })
        ]);

        await queryRunner.createForeignKeys("respostas_questoes", [
            new TableForeignKey({
                columnNames: ["entrega_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "entregas_atividades",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames: ["questao_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "questoes",
                onDelete: "CASCADE"
            }),
            new TableForeignKey({
                columnNames: ["alternativa_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "alternativas",
                onDelete: "SET NULL"
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("respostas_questoes");
        await queryRunner.dropTable("entregas_atividades");
    }
}