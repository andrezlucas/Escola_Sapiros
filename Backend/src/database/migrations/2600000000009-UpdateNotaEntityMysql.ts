import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNotaEntityMysql2600000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Renomear a coluna 'observacao' para 'feedback'
    await queryRunner.query(
      `ALTER TABLE notas CHANGE observacao feedback TEXT NULL`
    );

    // 2. Tornar a coluna 'valor' nullable e garantir a precisão
    await queryRunner.query(
      `ALTER TABLE notas MODIFY valor DECIMAL(5,2) NULL`
    );

    // 3. Adicionar as novas colunas
    await queryRunner.query(
      `ALTER TABLE notas ADD avaliacao_nome VARCHAR(255) NULL`
    );

    await queryRunner.query(
      `ALTER TABLE notas ADD habilidades JSON NULL`
    );

    // 4. Adicionar a coluna de status como ENUM direto na tabela
    await queryRunner.query(
      `ALTER TABLE notas ADD status ENUM('SALVO', 'PENDENTE') NOT NULL DEFAULT 'PENDENTE'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter adições
    await queryRunner.query(`ALTER TABLE notas DROP COLUMN status`);
    await queryRunner.query(`ALTER TABLE notas DROP COLUMN habilidades`);
    await queryRunner.query(`ALTER TABLE notas DROP COLUMN avaliacao_nome`);

    // Reverter valor para NOT NULL (certifique-se de que não há nulos antes de rodar o down)
    await queryRunner.query(
      `ALTER TABLE notas MODIFY valor DECIMAL(5,2) NOT NULL`
    );

    // Renomear feedback de volta para observacao
    await queryRunner.query(
      `ALTER TABLE notas CHANGE feedback observacao TEXT NULL`
    );
  }
}