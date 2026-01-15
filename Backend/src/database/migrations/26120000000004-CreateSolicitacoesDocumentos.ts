import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSolicitacoesDocumentos26120000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'solicitacoes_documentos',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
          },
          {
            name: 'protocolo',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'alunoId',
            type: 'char',
            length: '36',
            isNullable: false,
          },
          {
            name: 'tipoDocumento',
            type: 'enum',
            enum: [
              'atestado_matricula',
              'historico_escolar',
              'declaracao_vinculo_servidor',
              'atestado_vaga',
              'declaracao_matricula',
              'declaracao_frequencia',
              'declaracao_conclusao',
              'boletim',
            ],
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'pendente',
              'concluido',
              'em_andamento',
              'aprovado',
              'rejeitado',
            ],
            default: `'pendente'`,
          },
          {
            name: 'formaEntrega',
            type: 'enum',
            enum: ['presencial', 'email', 'correios'],
          },
          {
            name: 'motivo',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'arquivoUrl',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'atendidoPorId',
            type: 'char',
            length: '36',
            isNullable: true,
          },
          {
            name: 'criadoEm',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'atualizadoEm',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'solicitacoes_documentos',
      new TableForeignKey({
        columnNames: ['alunoId'],
        referencedTableName: 'alunos',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'solicitacoes_documentos',
      new TableForeignKey({
        columnNames: ['atendidoPorId'],
        referencedTableName: 'usuarios',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('solicitacoes_documentos');
  }
}
