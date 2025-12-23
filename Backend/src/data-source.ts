import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Usuario } from './usuario/entities/usuario.entity';
import { Aluno } from './aluno/entities/aluno.entity';
import { Professor } from './professor/entities/professor.entity';
import { Coordenacao } from './coordenacao/entities/coordenacao.entity';
import { Disciplina } from './disciplina/entities/disciplina.entity';
import { Nota } from './nota/entities/nota.entity';
import { Frequencia } from './frequencia/entities/frequencia.entity';
import { Aviso } from './avisos/entities/aviso.entity';
import { Turma } from './turma/entities/turma.entity';
import { Documentacao } from './documentacao/entities/documentacao.entity';
import * as dotenv from 'dotenv';
import { Documento } from './documentacao/entities/documento.entity';
import { Habilidade } from './disciplina/entities/habilidade.entity';
import { Formacao } from './professor/entities/formacao.entity';

dotenv.config({ path: '.env' });

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_DB_HOST,
  port: Number(process.env.MYSQL_DB_PORT),
  username: process.env.MYSQL_DB_USER,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_NAME,
  entities: [Usuario, Aluno, Professor, Coordenacao, Disciplina, Nota, Frequencia, Aviso, Turma, Documentacao,Documento,Habilidade,Formacao],
  migrations: ['dist/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});

