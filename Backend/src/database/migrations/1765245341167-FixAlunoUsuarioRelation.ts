import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAlunoUsuarioRelation1765245341167 implements MigrationInterface {
  name = 'FixAlunoUsuarioRelation1765245341167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Criar nova coluna usuario_id
    await queryRunner.query(`
      ALTER TABLE alunos
      ADD COLUMN usuario_id CHAR(36) NULL;
    `);

    // 2. Preencher usuario_id com o valor atual de id (pois antes aluno.id = usuario.id)
    await queryRunner.query(`
      UPDATE alunos
      SET usuario_id = id;
    `);

    // 3. Criar restrição UNIQUE para garantir 1–1
    await queryRunner.query(`
      ALTER TABLE alunos
      ADD CONSTRAINT UQ_Aluno_Usuario UNIQUE (usuario_id);
    `);

    // 4. Remover a FK antiga (id → usuarios.id)
    await queryRunner.query(`
      ALTER TABLE alunos
      DROP FOREIGN KEY FK_Aluno_Usuario;
    `);

    // 5. Criar FK nova usando usuario_id
    await queryRunner.query(`
      ALTER TABLE alunos
      ADD CONSTRAINT FK_Aluno_UsuarioId
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      ON DELETE CASCADE;
    `);

    // 6. Agora aluno.id deixa de ser FK — está correto mantê-lo apenas como PK
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverter FK nova
    await queryRunner.query(`
      ALTER TABLE alunos
      DROP FOREIGN KEY FK_Aluno_UsuarioId;
    `);

    // Remover UNIQUE
    await queryRunner.query(`
      ALTER TABLE alunos
      DROP INDEX UQ_Aluno_Usuario;
    `);

    // Remover coluna usuario_id
    await queryRunner.query(`
      ALTER TABLE alunos
      DROP COLUMN usuario_id;
    `);

    // Recriar FK antiga (id → usuarios.id)
    await queryRunner.query(`
      ALTER TABLE alunos
      ADD CONSTRAINT FK_Aluno_Usuario
      FOREIGN KEY (id) REFERENCES usuarios(id)
      ON DELETE CASCADE;
    `);
  }
}
