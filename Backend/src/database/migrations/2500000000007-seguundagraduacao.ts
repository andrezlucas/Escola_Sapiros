import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class seguundagraduacao2500000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'professores',
      new TableColumn({
        name: 'curso_segunda_graduacao',
        type: 'varchar',
        isNullable: true,
        length: '100',
        default: null, 
      }),
    );
    await queryRunner.addColumn(
      'professores',
      new TableColumn({
        name: 'instituicao_segunda_graduacao',
        type: 'varchar',
        isNullable: true,
        length: '100',
        default: null, 
      }),
    );
    await queryRunner.addColumn(
      'professores',
      new TableColumn({
        name: 'data_inicio_segunda_graduacao',
        type: 'date',
        isNullable: true,
        default: null, 
      }),
    );
    await queryRunner.addColumn(
      'professores',
      new TableColumn({
        name: 'data_conclusao_segunda_graduacao',
        type: 'date',
        isNullable: true,
        default: null, 
      }),   
    );
  }



  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('professores', 'curso_segunda_graduacao');
    await queryRunner.dropColumn('professores', 'instituicao_segunda_graduacao');
    await queryRunner.dropColumn('professores', 'data_inicio_segunda_graduacao');
    await queryRunner.dropColumn('professores', 'data_conclusao_segunda_graduacao');
  }
}