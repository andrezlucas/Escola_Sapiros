import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateTentativasSimulados2600000000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "tentativas_simulados",
        columns: [
          {
            name: "id",
            type: "char",
            length: "36",
            isPrimary: true,
            // não usar DEFAULT uuid() no MySQL, o TypeORM gera automaticamente
          },
          { name: "inicio_em", type: "timestamp", isNullable: false },
          { name: "fim_previsto", type: "timestamp", isNullable: false },
          { name: "entregue_em", type: "timestamp", isNullable: true },
          { name: "nota_final", type: "decimal", precision: 5, scale: 2, isNullable: false, default: 0 },
          { name: "simulado_id", type: "char", length: "36", isNullable: false },
          { name: "aluno_id", type: "char", length: "36", isNullable: false },
          { name: "criado_em", type: "timestamp", default: "CURRENT_TIMESTAMP" },
          { name: "atualizado_em", type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      "tentativas_simulados",
      new TableForeignKey({
        columnNames: ["simulado_id"],
        referencedTableName: "simulados",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "tentativas_simulados",
      new TableForeignKey({
        columnNames: ["aluno_id"],
        referencedTableName: "alunos",
        referencedColumnNames: ["id"],
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("tentativas_simulados");
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey("tentativas_simulados", fk);
      }
    }
    await queryRunner.dropTable("tentativas_simulados");
  }
}
