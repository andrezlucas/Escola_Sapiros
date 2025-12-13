import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  ParseEnumPipe,
  Get,
  Delete,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentacaoService } from './documentacao.service';
import { storageConfig } from '../upload/upload.config';
import { TipoDocumento } from './enums/tipo-documento.enum';
import { Documentacao } from './entities/documentacao.entity';
import { Documento } from './entities/documento.entity';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { SenhaExpiradaGuard } from 'src/auth/senha-expirada/senha-expirada.guard';

type AuthRequest = Request & {
  user?: Usuario | { id: string; role: Role } | any;
};

@UseGuards(JwtAuthGuard, RolesGuard, SenhaExpiradaGuard)
@Controller('documentacao')
export class DocumentacaoController {
  constructor(
    private readonly documentacaoService: DocumentacaoService,
  ) {}

  @Roles(Role.COORDENACAO)
  @Get()
  async findAll(): Promise<Documentacao[]> {
    return this.documentacaoService.findAll();
  }

  @Roles(Role.COORDENACAO)
  @Get(':documentacaoId')
  async findOne(
    @Param('documentacaoId') documentacaoId: string,
    @Req() req: AuthRequest,
  ): Promise<Documentacao> {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const documentacao = await this.documentacaoService.findOne(documentacaoId);
    
    if (!documentacao) {
      throw new NotFoundException('Documentação não encontrada');
    }

    if (userRole === Role.ALUNO && documentacao.aluno?.id !== userId) {
        throw new NotFoundException('Documentação não encontrada ou acesso negado.');
    }

    return documentacao;
  }

  @Roles(Role.COORDENACAO)
  @Post(':documentacaoId/upload')
  @UseInterceptors(FileInterceptor('arquivo', storageConfig))
  substituir(
    @Param('documentacaoId') documentacaoId: string,
    @Body('tipo', new ParseEnumPipe(TipoDocumento)) tipo: TipoDocumento,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Documento> {
    return this.documentacaoService.substituirDocumento(
      documentacaoId,
      tipo,
      file,
    );
  }

  @Roles(Role.COORDENACAO)
  @Delete(':documentacaoId/documentos/:documentoId')
  async removeDocumento(
    @Param('documentacaoId') documentacaoId: string,
    @Param('documentoId') documentoId: string,
  ): Promise<void> {
    await this.documentacaoService.removeDocumento(documentacaoId, documentoId);
  }

  @Roles(Role.COORDENACAO)
  @Delete(':documentacaoId')
  async remove(@Param('documentacaoId') documentacaoId: string): Promise<void> {
    await this.documentacaoService.remove(documentacaoId);
  }
}