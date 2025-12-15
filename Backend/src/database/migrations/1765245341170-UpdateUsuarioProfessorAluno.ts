import { MigrationInterface, QueryRunner, TableColumn, Table } from 'typeorm';

export class UpdateUsuarioProfessorAluno1765245341170 implements MigrationInterface {
  name = 'UpdateUsuarioProfessorAluno1765245341170';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============================
    // ALTERAÇÃO DA TABELA USUÁRIOS
    // ============================
    const usuarioTable: Table | undefined = await queryRunner.getTable('usuarios');

    if (usuarioTable) {
      const columnsToAdd: TableColumn[] = [
        new TableColumn({ name: 'endereco_logradouro', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'endereco_numero', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'endereco_cep', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'endereco_complemento', type: 'varchar', length: '255', isNullable: true }),
        new TableColumn({ name: 'endereco_bairro', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'endereco_estado', type: 'char', length: '2', isNullable: false }),
        new TableColumn({ name: 'endereco_cidade', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'senha_expira_em', type: 'timestamp', default: 'DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 180 DAY)' }),
        new TableColumn({ name: 'senha_atualizada_em', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }),
        new TableColumn({ name: 'is_blocked', type: 'boolean', default: false }),
        new TableColumn({ name: 'sexo', type: 'enum', enum: ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'], default: "'NAO_INFORMADO'" }),
        new TableColumn({ name: 'criado_em', type: 'timestamp', default: 'CURRENT_TIMESTAMP' }),
        new TableColumn({ name: 'atualizado_em', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' }),
      ];

      for (const column of columnsToAdd) {
        if (!usuarioTable.columns.find(c => c.name === column.name)) {
          await queryRunner.addColumn('usuarios', column);
        }
      }
    }

    // ============================
    // ALTERAÇÃO DA TABELA PROFESSORES
    // ============================
    const professorTable: Table | undefined = await queryRunner.getTable('professores');

    if (professorTable) {
      const professorColumnsToAdd: TableColumn[] = [
        new TableColumn({ name: 'curso_graduacao', type: 'varchar', length: '100', isNullable: false }),
        new TableColumn({ name: 'instituicao', type: 'varchar', length: '100', isNullable: false }),
        new TableColumn({ name: 'data_inicio_graduacao', type: 'date', isNullable: false }),
        new TableColumn({ name: 'data_conclusao_graduacao', type: 'date', isNullable: true }),
      ];

      for (const column of professorColumnsToAdd) {
        if (!professorTable.columns.find(c => c.name === column.name)) {
          await queryRunner.addColumn('professores', column);
        }
      }
    }

    // ============================
    // ALTERAÇÃO DA TABELA ALUNOS
    // ============================
    const alunoTable: Table | undefined = await queryRunner.getTable('alunos');

    if (alunoTable) {
      const alunoColumnsToAdd: TableColumn[] = [
        new TableColumn({ name: 'matricula_aluno', type: 'varchar', length: '255', isUnique: true, isNullable: false }),
        new TableColumn({ name: 'serie_ano', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'escola_origem', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'rg_numero', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'rg_data_emissao', type: 'date', isNullable: false }),
        new TableColumn({ name: 'rg_orgao_emissor', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'nacionalidade', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'naturalidade', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'possui_necessidades_especiais', type: 'boolean', default: false }),
        new TableColumn({ name: 'descricao_necessidades_especiais', type: 'text', isNullable: true }),
        new TableColumn({ name: 'possui_alergias', type: 'boolean', default: false }),
        new TableColumn({ name: 'descricao_alergias', type: 'text', isNullable: true }),
        new TableColumn({ name: 'autorizacao_saida_sozinho', type: 'boolean', default: false }),
        new TableColumn({ name: 'autorizacao_uso_imagem', type: 'boolean', default: false }),
        new TableColumn({ name: 'responsavel_nome', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_data_nascimento', type: 'date', isNullable: false }),
        new TableColumn({ name: 'responsavel_sexo', type: 'enum', enum: ['MASCULINO','FEMININO','OUTRO','NAO_INFORMADO'], default: "'NAO_INFORMADO'" }),
        new TableColumn({ name: 'responsavel_nacionalidade', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_naturalidade', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_cpf', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_rg', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_rg_orgao_emissor', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_telefone', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_email', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_cep', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_logradouro', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_numero', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_complemento', type: 'varchar', length: '255', isNullable: true }),
        new TableColumn({ name: 'responsavel_bairro', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_cidade', type: 'varchar', length: '255', isNullable: false }),
        new TableColumn({ name: 'responsavel_estado', type: 'char', length: '2', isNullable: false }),
      ];

      for (const column of alunoColumnsToAdd) {
        if (!alunoTable.columns.find(c => c.name === column.name)) {
          await queryRunner.addColumn('alunos', column);
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const usuarioTable = await queryRunner.getTable('usuarios');
    const professorTable = await queryRunner.getTable('professores');
    const alunoTable = await queryRunner.getTable('alunos');

    if (usuarioTable) {
      for (const col of [
        'endereco_logradouro','endereco_numero','endereco_cep','endereco_complemento',
        'endereco_bairro','endereco_estado','endereco_cidade','senha_expira_em',
        'senha_atualizada_em','is_blocked','sexo','criado_em','atualizado_em'
      ]) {
        if (usuarioTable.columns.find(c => c.name === col)) {
          await queryRunner.dropColumn('usuarios', col);
        }
      }
    }

    if (professorTable) {
      for (const col of ['curso_graduacao','instituicao','data_inicio_graduacao','data_conclusao_graduacao']) {
        if (professorTable.columns.find(c => c.name === col)) {
          await queryRunner.dropColumn('professores', col);
        }
      }
    }

    if (alunoTable) {
      const alunoCols = [
        'matricula_aluno','serie_ano','escola_origem','rg_numero','rg_data_emissao','rg_orgao_emissor',
        'nacionalidade','naturalidade','possui_necessidades_especiais','descricao_necessidades_especiais',
        'possui_alergias','descricao_alergias','autorizacao_saida_sozinho','autorizacao_uso_imagem',
        'responsavel_nome','responsavel_data_nascimento','responsavel_sexo','responsavel_nacionalidade',
        'responsavel_naturalidade','responsavel_cpf','responsavel_rg','responsavel_rg_orgao_emissor',
        'responsavel_telefone','responsavel_email','responsavel_cep','responsavel_logradouro','responsavel_numero',
        'responsavel_complemento','responsavel_bairro','responsavel_cidade','responsavel_estado'
      ];

      for (const col of alunoCols) {
        if (alunoTable.columns.find(c => c.name === col)) {
          await queryRunner.dropColumn('alunos', col);
        }
      }
    }
  }
}
