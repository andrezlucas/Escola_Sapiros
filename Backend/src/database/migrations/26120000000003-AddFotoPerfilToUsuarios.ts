import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFotoPerfilToUsuarios26120000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'usuarios', // nome da tabela
      new TableColumn({
        name: 'foto_perfil',
        type: 'varchar',
        length: '255',  // define o tamanho máximo da string
        isNullable: true, // permite valores nulos
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('usuarios', 'foto_perfil');
  }
}
