import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProfessorModule } from './professor/professor.module';
import { AlunoModule } from './aluno/aluno.module';
import { ResponsavelModule } from './responsavel/responsavel.module';
import { SecretariaModule } from './secretaria/secretaria.module';
import { TurmaModule } from './turma/turma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.MYSQL_DB_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_DB_PORT || '3306', 10),
        username: process.env.MYSQL_DB_USERNAME || 'root',
        password: process.env.MYSQL_DB_PASSWORD || 'root',
        database: process.env.MYSQL_DB_DATABASE || 'sapiros_db',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }), 

    UsuarioModule,
    AuthModule,
    ProfessorModule,
    AlunoModule,
    ResponsavelModule,
    SecretariaModule,
    TurmaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

