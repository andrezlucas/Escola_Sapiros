import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentosTable1765245341169 implements MigrationInterface {
  name = 'CreateDocumentosTable1765245341169';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Definição dos valores do ENUM para o tipo de documento
    const tipoDocumentoEnum = [
      'RG_ALUNO',
      'CPF_ALUNO',
      'CERTIDAO_NASCIMENTO',
      'COMPROVANTE_RESIDENCIA_ALUNO',
      'FOTO_3X4',
      'HISTORICO_ESCOLAR',
      'RG_RESPONSAVEL',
      'CPF_RESPONSAVEL',
      'COMPROVANTE_RESIDENCIA_RESP',
    ]
      .map((value) => `'${value}'`)
      .join(', ');

    // Criação da Tabela Documentos
    await queryRunner.query(`
      CREATE TABLE documentos (
        id CHAR(36) NOT NULL,
        
        documentacao_id CHAR(36) NOT NULL,
        
        tipo ENUM(${tipoDocumentoEnum}) NOT NULL,
        
        nomeOriginal VARCHAR(255) NOT NULL,
        nomeArquivo VARCHAR(255) NOT NULL,
        caminho VARCHAR(255) NOT NULL,
        mimeType VARCHAR(255) NOT NULL,
        tamanho INT NOT NULL,

        criadoEm TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        PRIMARY KEY (id)
      );
    `);

    // Adição da Chave Estrangeira
    await queryRunner.query(`
        ALTER TABLE documentos
        ADD CONSTRAINT FK_Documento_Documentacao
        FOREIGN KEY (documentacao_id) 
        REFERENCES documentacoes(id) 
        ON DELETE CASCADE;
    `);

    // Adição de Índice para otimização de busca por tipo e documentação
    await queryRunner.query(`
        CREATE INDEX IDX_Documentos_DocumentacaoId_Tipo ON documentos (documentacao_id, tipo);
    `);

    // Adição da restrição de unicidade (opcional, mas recomendado para o fluxo de substituição)
    // Isso garante que só haja um documento de cada 'tipo' por 'documentacao'.
    await queryRunner.query(`
        ALTER TABLE documentos
        ADD CONSTRAINT UQ_Documento_DocumentacaoId_Tipo UNIQUE (documentacao_id, tipo);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS documentos`);
  }
}