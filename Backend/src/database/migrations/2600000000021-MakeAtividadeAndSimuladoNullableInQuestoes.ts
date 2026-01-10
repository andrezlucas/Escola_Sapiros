import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeAtividadeAndSimuladoNullableInQuestoes2600000000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tenta descobrir o nome real da FK e remove se existir
    // Isso evita o erro "Can't DROP FK_questao_simulado"
    const table = await queryRunner.getTable("questoes");
    const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf("simulado_id") !== -1);
    
    if (foreignKey) {
      await queryRunner.dropForeignKey("questoes", foreignKey);
    }

    // 2. Alterar colunas para aceitar NULL (Caso ainda não estejam)
    await queryRunner.query(`ALTER TABLE questoes MODIFY atividade_id varchar(255) NULL;`);
    await queryRunner.query(`ALTER TABLE questoes MODIFY simulado_id varchar(255) NULL;`);

    // 3. Recriar a FK com o nome padrão que você deseja
    await queryRunner.query(`
      ALTER TABLE questoes 
      ADD CONSTRAINT FK_questao_simulado 
      FOREIGN KEY (simulado_id) REFERENCES simulados(id) ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter as alterações se necessário
    await queryRunner.query(`ALTER TABLE questoes DROP FOREIGN KEY FK_questao_simulado;`);
    await queryRunner.query(`ALTER TABLE questoes MODIFY atividade_id varchar(255) NOT NULL;`);
    await queryRunner.query(`ALTER TABLE questoes MODIFY simulado_id varchar(255) NOT NULL;`);
  }
}