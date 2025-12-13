import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentosTable1765245341169 implements MigrationInterface {
  name = 'CreateDocumentosTable1765245341169';

  public async up(queryRunner: QueryRunner): Promise<void> {
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

    await queryRunner.query(`
      CREATE TABLE documentos (
        id CHAR(36) NOT NULL,
        
        documentacao_id CHAR(36) NOT NULL,
        
        tipo ENUM(${tipoDocumentoEnum}) NOT NULL,
        
        nome_original VARCHAR(255) NOT NULL,
        nome_arquivo VARCHAR(255) NOT NULL,
        caminho VARCHAR(255) NOT NULL,
        mime_type VARCHAR(255) NOT NULL,
        tamanho INT NOT NULL,

        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        PRIMARY KEY (id)
      );
    `);

    await queryRunner.query(`
        ALTER TABLE documentos
        ADD CONSTRAINT FK_Documento_Documentacao
        FOREIGN KEY (documentacao_id) 
        REFERENCES documentacoes(id) 
        ON DELETE CASCADE;
    `);

    await queryRunner.query(`
        CREATE INDEX IDX_Documentos_DocumentacaoId_Tipo ON documentos (documentacao_id, tipo);
    `);

    await queryRunner.query(`
        ALTER TABLE documentos
        ADD CONSTRAINT UQ_Documento_DocumentacaoId_Tipo UNIQUE (documentacao_id, tipo);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS documentos`);
  }
}