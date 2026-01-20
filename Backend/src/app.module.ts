import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfessorModule } from './professor/professor.module';
import { AlunoModule } from './aluno/aluno.module';
import { CoordenacaoModule } from './coordenacao/coordenacao.module';
import { DisciplinaModule } from './disciplina/disciplina.module';
import { NotaModule } from './nota/nota.module';
import { FrequenciaModule } from './frequencia/frequencia.module';
import { AvisosModule } from './avisos/avisos.module';
import { MailModule } from './mail/mail.module';
import { TurmaModule } from './turma/turma.module';
import { AtividadeModule } from './atividade/atividade.module';
import { RelatoriosHabilidadesModule } from './relatorio/relatorios-habilidades.module';
import { MaterialModule } from './material/material.module';
import { SimuladoModule } from './simulado/simulado.module';
import { ConfiguracoesModule } from './configurações/configuracoes.module';
import { IaModule } from './ia/ia.module';
import { EmissaoDocumentosModule } from './emissao-documentos/emissao-documentos.module';
import { AuditModule } from './audit/audit.module';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AccessAuditMiddleware } from './audit/access-audit.middleware';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.MYSQL_DB_HOST,
        port: Number(process.env.MYSQL_DB_PORT),
        username: process.env.MYSQL_DB_USER,
        password: process.env.MYSQL_DB_PASSWORD,
        database: process.env.MYSQL_DB_NAME,
       autoLoadEntities: true,        // Carrega todas as entidades automaticamente
        synchronize: false,            // Nunca use synchronize com migrations
        migrationsRun: true,           // Executa todas as migrations pendentes
        migrations: ['dist/database/migrations/*.js'],
        cli: {
          migrationsDir: 'src/database/migrations',
        },
        }),
    }),

    UsuarioModule,
    AuthModule,
    ProfessorModule,
    AlunoModule,
    CoordenacaoModule,
    DisciplinaModule,
    NotaModule,
    FrequenciaModule,
    AvisosModule,
    MailModule,
    TurmaModule,
    AtividadeModule,
    RelatoriosHabilidadesModule,
    MaterialModule,
    SimuladoModule,
    ConfiguracoesModule,
    EmissaoDocumentosModule,
    IaModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AccessAuditMiddleware)
      .forRoutes('*');
  }
}