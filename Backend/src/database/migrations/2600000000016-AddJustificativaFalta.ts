import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddJustificativaFalta2600000000016
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    /* 1️⃣ Atualiza ENUM tipo_documento */
    await queryRunner.query(`
      ALTER TABLE documentos
      MODIFY tipo ENUM(
        'RG_ALUNO',
        'CPF_ALUNO',
        'CERTIDAO_NASCIMENTO',
        'COMPROVANTE_RESIDENCIA_ALUNO',
        'FOTO_3X4',
        'HISTORICO_ESCOLAR',
        'RG_RESPONSAVEL',
        'CPF_RESPONSAVEL',
        'COMPROVANTE_RESIDENCIA_RESP',
        'JUSTIFICATIVA_FALTA'
      ) NOT NULL
    `);

    /* 2️⃣ Adiciona coluna frequencia_id */
    await queryRunner.addColumn(
      'documentos',
      new TableColumn({
        name: 'frequencia_id',
        type: 'char',
        length: '36',
        isNullable: true,
      }),
    );

    /* 3️⃣ FK documentos → frequencias */
    await queryRunner.createForeignKey(
      'documentos',
      new TableForeignKey({
        columnNames: ['frequencia_id'],
        referencedTableName: 'frequencias',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    /* 4️⃣ Atualiza ENUM status da frequencia */
    await queryRunner.query(`
      ALTER TABLE frequencias
      MODIFY status ENUM(
        'PRESENTE',
        'FALTA',
        'JUSTIFICADA'
      ) NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /* rollback status frequencia */
    await queryRunner.query(`
      ALTER TABLE frequencias
      MODIFY status ENUM(
        'PRESENTE',
        'FALTA'
      ) NOT NULL
    `);

    /* rollback FK e coluna documentos */
    const table = await queryRunner.getTable('documentos');

    if (table) {
      const fk = table.foreignKeys.find(fk =>
        fk.columnNames.includes('frequencia_id'),
      );

      if (fk) {
        await queryRunner.dropForeignKey('documentos', fk);
      }
    }

    await queryRunner.dropColumn('documentos', 'frequencia_id');

    /* rollback enum tipo_documento */
    await queryRunner.query(`
      ALTER TABLE documentos
      MODIFY tipo ENUM(
        'RG_ALUNO',
        'CPF_ALUNO',
        'CERTIDAO_NASCIMENTO',
        'COMPROVANTE_RESIDENCIA_ALUNO',
        'FOTO_3X4',
        'HISTORICO_ESCOLAR',
        'RG_RESPONSAVEL',
        'CPF_RESPONSAVEL',
        'COMPROVANTE_RESIDENCIA_RESP'
      ) NOT NULL
    `);
  }
}
