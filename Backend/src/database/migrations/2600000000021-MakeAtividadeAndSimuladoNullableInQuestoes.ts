import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeAtividadeAndSimuladoNullableInQuestoes2600000000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop FK de simulado
    await queryRunner.query(`
      ALTER TABLE questoes DROP FOREIGN KEY FK_questao_simulado;
    `);

    // Alterar colunas para aceitar NULL
    await queryRunner.query(`
      ALTER TABLE questoes MODIFY atividade_id varchar(255) NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE questoes MODIFY simulado_id varchar(255) NULL;
    `);

    // Recriar FK de simulado
    await queryRunner.query(`
      ALTER TABLE questoes 
      ADD CONSTRAINT FK_questao_simulado FOREIGN KEY (simulado_id) REFERENCES simulados(id) ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop FK recriada
    await queryRunner.query(`
      ALTER TABLE questoes DROP FOREIGN KEY FK_questao_simulado;
    `);

    // Voltar colunas para NOT NULL
    await queryRunner.query(`
      ALTER TABLE questoes MODIFY atividade_id varchar(255) NOT NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE questoes MODIFY simulado_id varchar(255) NOT NULL;
    `);

    // Recriar FK original
    await queryRunner.query(`
      ALTER TABLE questoes 
      ADD CONSTRAINT FK_questao_simulado FOREIGN KEY (simulado_id) REFERENCES simulados(id) ON DELETE CASCADE;
    `);
  }
}
