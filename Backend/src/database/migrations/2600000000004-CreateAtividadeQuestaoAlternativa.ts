import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAtividadeQuestaoAlternativa2600000000004
  implements MigrationInterface
{
  name = 'CreateAtividadeQuestaoAlternativa2600000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE atividades (
        id CHAR(36) PRIMARY KEY,
        versao INT NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descricao TEXT,
        data_entrega TIMESTAMP NOT NULL,
        valor DECIMAL(5,2),
        ativa BOOLEAN NOT NULL DEFAULT true,
        professor_id CHAR(36) NOT NULL,
        disciplina_id CHAR(36) NOT NULL,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_atividade_professor
          FOREIGN KEY (professor_id)
          REFERENCES professores(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_atividade_disciplina
          FOREIGN KEY (disciplina_id)
          REFERENCES disciplinas(id_disciplina)
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE atividades_turmas (
        atividade_id CHAR(36) NOT NULL,
        turma_id CHAR(36) NOT NULL,
        PRIMARY KEY (atividade_id, turma_id),

        CONSTRAINT fk_ativ_turma_atividade
          FOREIGN KEY (atividade_id)
          REFERENCES atividades(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_ativ_turma_turma
          FOREIGN KEY (turma_id)
          REFERENCES turmas(id)
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE atividades_habilidades (
        atividade_id CHAR(36) NOT NULL,
        habilidade_id CHAR(36) NOT NULL,
        PRIMARY KEY (atividade_id, habilidade_id),

        CONSTRAINT fk_ativ_hab_atividade
          FOREIGN KEY (atividade_id)
          REFERENCES atividades(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_ativ_hab_habilidade
          FOREIGN KEY (habilidade_id)
          REFERENCES habilidades(id)
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE questoes (
        id CHAR(36) PRIMARY KEY,
        enunciado TEXT NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        valor DECIMAL(5,2) NOT NULL DEFAULT 1.0,
        atividade_id CHAR(36) NOT NULL,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_questao_atividade
          FOREIGN KEY (atividade_id)
          REFERENCES atividades(id)
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE alternativas (
        id CHAR(36) PRIMARY KEY,
        texto TEXT NOT NULL,
        correta BOOLEAN NOT NULL DEFAULT false,
        letra VARCHAR(1),
        questao_id CHAR(36) NOT NULL,
        criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

        CONSTRAINT fk_alternativa_questao
          FOREIGN KEY (questao_id)
          REFERENCES questoes(id)
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE alternativas`);
    await queryRunner.query(`DROP TABLE questoes`);
    await queryRunner.query(`DROP TABLE atividades_habilidades`);
    await queryRunner.query(`DROP TABLE atividades_turmas`);
    await queryRunner.query(`DROP TABLE atividades`);
  }
}
