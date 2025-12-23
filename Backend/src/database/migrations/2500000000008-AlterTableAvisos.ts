import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTableAvisos2500000000008 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {

    // 1. Criar colunas novas (se ainda não existirem)
    await queryRunner.addColumn(
      'avisos',
      new TableColumn({
        name: 'nome',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'avisos',
      new TableColumn({
        name: 'descricao',
        type: 'text',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'avisos',
      new TableColumn({
        name: 'data_inicio',
        type: 'timestamp',
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'avisos',
      new TableColumn({
        name: 'data_final',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // 2. Migrar dados antigos (se existirem)
    await queryRunner.query(`
      UPDATE avisos 
      SET 
        nome = titulo,
        descricao = conteudo,
        data_inicio = data_publicacao,
        data_final = data_expiracao
    `);

    // 3. Adicionar destinatário individual
    await queryRunner.addColumn(
      'avisos',
      new TableColumn({
        name: 'destinatario_aluno_id',
        type: 'char',
        length: '36',
        isNullable: true,
      }),
    );

    // 4. Remover colunas antigas (por último!)
    await queryRunner.dropColumn('avisos', 'titulo');
    await queryRunner.dropColumn('avisos', 'conteudo');
    await queryRunner.dropColumn('avisos', 'data_publicacao');
    await queryRunner.dropColumn('avisos', 'data_expiracao');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {

    // Recriar colunas antigas
    await queryRunner.addColumn(
      'avisos',
      new TableColumn({
        name: 'titulo',
        type: 'varchar',
        length: '255',
      }),
    );

    await queryRunner.addColumn(
      'avisos',
      new TableColumn({
        name: 'conteudo',
        type: 'text',
      }),
    );

    await queryRunner.addColumn(
      'avisos',
      new TableColumn({
        name: 'data_publicacao',
        type: 'timestamp',
      }),
    );

    await queryRunner.addColumn(
      'avisos',
      new TableColumn({
        name: 'data_expiracao',
        type: 'timestamp',
        isNullable: true,
      }),
    );

    // Voltar dados
    await queryRunner.query(`
      UPDATE avisos 
      SET 
        titulo = nome,
        conteudo = descricao,
        data_publicacao = data_inicio,
        data_expiracao = data_final
    `);

    // Limpeza
    await queryRunner.dropColumn('avisos', 'destinatario_aluno_id');
    await queryRunner.dropColumn('avisos', 'nome');
    await queryRunner.dropColumn('avisos', 'descricao');
    await queryRunner.dropColumn('avisos', 'data_inicio');
    await queryRunner.dropColumn('avisos', 'data_final');
  }
}
