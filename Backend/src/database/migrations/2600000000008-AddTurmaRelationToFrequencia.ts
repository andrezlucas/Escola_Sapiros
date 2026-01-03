import { MigrationInterface, QueryRunner, } from 'typeorm';

export class AddTurmaRelationToFrequencia2600000000008 implements MigrationInterface {
  name = 'AddTurmaRelationToFrequencia2600000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Verifica se a tabela frequencias existe
    const hasFrequenciasTable = await queryRunner.hasTable('frequencias');
    if (!hasFrequenciasTable) {
      throw new Error('A tabela frequencias não existe. Execute os migrations anteriores primeiro.');
    }

    // 2. Verifica se a coluna turma_id já existe
    const hasColumn = await queryRunner.hasColumn('frequencias', 'turma_id');
    
    if (!hasColumn) {
      // 3. Adiciona a coluna turma_id como UUID não nulo
      await queryRunner.query(`
        ALTER TABLE frequencias 
        ADD COLUMN turma_id varchar(36) NOT NULL AFTER disciplina_id
      `);

      // 4. Adiciona a chave estrangeira
      await queryRunner.query(`
        ALTER TABLE frequencias
        ADD CONSTRAINT FK_frequencias_turma
        FOREIGN KEY (turma_id) REFERENCES turmas(id)
        ON DELETE CASCADE
      `);

      // 5. Cria um índice para melhorar o desempenho
      await queryRunner.query(`
        CREATE INDEX IDX_frequencias_turma_id ON frequencias(turma_id)
      `);
    }

    // 6. Verifica se a tabela turmas tem a relação
const turmasTable = await queryRunner.getTable('turmas');
if (turmasTable) {
  const hasFrequenciasInTurmas = turmasTable.foreignKeys.some(
    fk => fk.columnNames.includes('frequencias')
  );
  if (!hasFrequenciasInTurmas) {
    console.log('A relação OneToMany será gerenciada pelo TypeORM, sem alterações no banco necessárias.');
  }
}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove a chave estrangeira
    const fkName = await queryRunner.query(`
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'frequencias'
        AND COLUMN_NAME = 'turma_id'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `);

    if (fkName && fkName[0]) {
      await queryRunner.query(`
        ALTER TABLE frequencias
        DROP FOREIGN KEY \`${fkName[0].CONSTRAINT_NAME}\`
      `);
    }

    // 2. Remove o índice
const table = await queryRunner.getTable('frequencias');
if (table) {
  const index = table.indices.find(i => i.name === 'IDX_frequencias_turma_id');
  if (index) {
    await queryRunner.dropIndex('frequencias', index);
  }
}

    // 3. Remove a coluna
    const hasColumn = await queryRunner.hasColumn('frequencias', 'turma_id');
    if (hasColumn) {
      await queryRunner.query(`
        ALTER TABLE frequencias
        DROP COLUMN turma_id
      `);
    }
  }
}