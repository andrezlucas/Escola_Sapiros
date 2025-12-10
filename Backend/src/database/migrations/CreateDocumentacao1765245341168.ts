import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentacao1765245341168 implements MigrationInterface {
  name = 'CreateDocumentacao1765245341168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE documentacoes (
        id CHAR(36) NOT NULL,
        cpf VARCHAR(255) UNIQUE NOT NULL,
        rgNumero VARCHAR(255),
        certidaoNumero VARCHAR(255),
        observacoes TEXT,
        aluno_id CHAR(36) UNIQUE,
        criadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizadoEm TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        CONSTRAINT FK_Documentacao_Aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS documentacoes`);
  }
}
