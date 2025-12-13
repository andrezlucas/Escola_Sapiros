import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentacao1765245341168 implements MigrationInterface {
  name = 'CreateDocumentacao1765245341168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE documentacoes (
        id CHAR(36) NOT NULL,
        aluno_id CHAR(36) UNIQUE,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        PRIMARY KEY (id)
      );
    `);
    
    await queryRunner.query(`
        ALTER TABLE documentacoes
        ADD CONSTRAINT FK_Documentacao_Aluno 
        FOREIGN KEY (aluno_id) 
        REFERENCES alunos(id) 
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
        CREATE UNIQUE INDEX IDX_Documentacao_alunoId ON documentacoes (aluno_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS documentacoes`);
  }
}