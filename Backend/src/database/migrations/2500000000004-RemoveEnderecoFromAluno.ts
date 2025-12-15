import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEnderecoFromAlunos2500000000004
  implements MigrationInterface
{
  name = 'RemoveEnderecoFromAlunos2500000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE alunos
        DROP COLUMN endereco_logradouro,
        DROP COLUMN endereco_numero,
        DROP COLUMN endereco_cep,
        DROP COLUMN endereco_complemento,
        DROP COLUMN endereco_bairro,
        DROP COLUMN endereco_cidade,
        DROP COLUMN endereco_estado
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE alunos
        ADD endereco_logradouro VARCHAR(255) NOT NULL,
        ADD endereco_numero VARCHAR(50) NOT NULL,
        ADD endereco_cep VARCHAR(20) NOT NULL,
        ADD endereco_complemento VARCHAR(255),
        ADD endereco_bairro VARCHAR(255) NOT NULL,
        ADD endereco_cidade VARCHAR(255) NOT NULL,
        ADD endereco_estado VARCHAR(50) NOT NULL
    `);
  }
}
