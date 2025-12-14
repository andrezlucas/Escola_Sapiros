import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCapacidadeMaximaToTurmas2199999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'turmas',
      new TableColumn({
        name: 'capacidade_maxima',
        type: 'int',
        isNullable: false,
        default: 0, // ou outro valor padrão que faça sentido
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('turmas', 'capacidade_maxima');
  }
}
