import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class AlterProfessorAndCreateFormacao2500000000009 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Criar a tabela de formacoes
        await queryRunner.createTable(new Table({
            name: "formacoes",
            columns: [
                {
                    name: "id",
                    type: "char",
                    length: "36",
                    isPrimary: true,
                },
                {
                    name: "curso",
                    type: "varchar",
                    length: "100",
                },
                {
                    name: "instituicao",
                    type: "varchar",
                    length: "100",
                },
                {
                    name: "dataInicio",
                    type: "date",
                },
                {
                    name: "dataConclusao",
                    type: "date",
                    isNullable: true,
                },
                {
                    name: "professorId",
                    type: "char",
                    length: "36",
                },
                {
                    name: "criadoEm",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                },
                {
                    name: "atualizadoEm",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP",
                    onUpdate: "CURRENT_TIMESTAMP",
                }
            ]
        }), true);

        // 2. Adicionar Foreign Key na tabela formacoes
        await queryRunner.createForeignKey("formacoes", new TableForeignKey({
            columnNames: ["professorId"],
            referencedColumnNames: ["id"],
            referencedTableName: "professores",
            onDelete: "CASCADE"
        }));

        // 3. Remover colunas antigas da tabela professores
        await queryRunner.dropColumns("professores", [
            "formacao",
            "curso_graduacao",
            "instituicao",
            "data_inicio_graduacao",
            "data_conclusao_graduacao",
            "curso_segunda_graduacao",
            "instituicao_segunda_graduacao",
            "data_inicio_segunda_graduacao",
            "data_conclusao_segunda_graduacao"
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverter as remoções (Adicionar as colunas de volta)
        await queryRunner.addColumns("professores", [
            /* ... especificações das colunas originais caso precise fazer rollback ... */
        ]);

        // Remover a tabela criada
        await queryRunner.dropTable("formacoes");
    }
}