import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueAvisoUsuarioConfirmacao2600000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE avisos_confirmacoes
      ADD CONSTRAINT uq_aviso_usuario_confirmacao
      UNIQUE (aviso_id, usuario_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE avisos_confirmacoes
      DROP INDEX uq_aviso_usuario_confirmacao
    `);
  }
}
