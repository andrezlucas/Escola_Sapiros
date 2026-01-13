import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
  Patch,
  Delete,
  ParseUUIDPipe,
  BadRequestException,
  Req,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario, Role } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { SenhaExpiradaGuard } from 'src/auth/senha-expirada/senha-expirada.guard';
import { UpdateUsuarioBlockDto } from './dto/UpdateUsuarioBlockDto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

type UsuarioResponse = Omit<
  Usuario,
  | 'senha'
  | 'senhaExpiraEm'
  | 'senhaAtualizadaEm'
  | 'UsuariocriadoEm'
  | 'UsuarioatualizadoEm'
> & {
  senhaExpiraEm: string;
  senhaAtualizadaEm: string;
  UsuariocriadoEm: string;
  UsuarioatualizadoEm: string;
};

function formatarDataISO(data?: Date | string | null): string | null {
  if (!data) return null;
  const d = typeof data === 'string' ? new Date(data) : data;
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function formatarUsuario(u: Partial<Usuario>): UsuarioResponse {
  const {
    senha,
    senhaExpiraEm,
    senhaAtualizadaEm,
    criadoEm,
    atualizadoEm,
    ...resto
  } = u;

  return {
    ...resto,
    senhaExpiraEm: formatarDataISO(senhaExpiraEm) as string,
    senhaAtualizadaEm: formatarDataISO(senhaAtualizadaEm) as string,
    UsuariocriadoEm: formatarDataISO(criadoEm) as string,
    UsuarioatualizadoEm: formatarDataISO(atualizadoEm) as string,
  } as UsuarioResponse;
}

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard, SenhaExpiradaGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get('me')
  async me(@Req() req) {
    const usuario = await this.usuarioService.findOne(req.user.id);

    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,

      twoFactorEnabled: usuario.twoFactorEnabled,
      ultimoLoginEm: usuario.ultimoLoginEm,
    };
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Get()
  async findAll(): Promise<UsuarioResponse[]> {
    const usuarios = await this.usuarioService.findAll();
    return usuarios.map((u) => formatarUsuario(u));
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Get('role/:role')
  async findByRole(
    @Param('role') roleParam: string,
  ): Promise<UsuarioResponse[]> {
    const roleLower = roleParam.toLowerCase();
    const validRoles = Object.values(Role);

    if (!validRoles.includes(roleLower as Role)) {
      throw new BadRequestException(
        `Role inválida. Valores válidos: ${validRoles.join(', ')}`,
      );
    }

    const usuarios = await this.usuarioService.findByRole(roleLower as Role);
    return usuarios.map((u) => formatarUsuario(u));
  }

  @Roles(Role.COORDENACAO, Role.PROFESSOR)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UsuarioResponse> {
    const usuario = await this.usuarioService.findOne(id);
    return formatarUsuario(usuario);
  }

  @Roles(Role.COORDENACAO)
  @Post()
  async create(@Body() dto: CreateUsuarioDto): Promise<UsuarioResponse> {
    const usuario = await this.usuarioService.create(dto);
    return formatarUsuario(usuario);
  }

  @Roles(Role.COORDENACAO)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
  ): Promise<UsuarioResponse> {
    const usuario = await this.usuarioService.update(id, dto);
    return formatarUsuario(usuario);
  }

  @Roles(Role.COORDENACAO)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ message: string }> {
    await this.usuarioService.remove(id);
    return { message: 'Usuário removido com sucesso' };
  }

  @Roles(Role.COORDENACAO)
  @Patch(':id/block')
  async setBlocked(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioBlockDto,
  ): Promise<UsuarioResponse> {
    const usuario = await this.usuarioService.setBlocked(id, dto.isBlocked);
    return formatarUsuario(usuario);
  }

  @Post(':id/foto-perfil')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/fotos';
          // Cria a pasta se não existir
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `foto-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return callback(new BadRequestException('Apenas imagens são permitidas!'), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadFotoPerfil(
    @Param('id') usuarioId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new NotFoundException('Arquivo não enviado');
    }

    // Atualiza o caminho da foto no banco
    await this.usuarioService.updateFotoPerfil(usuarioId, file.path);

    // Retorna URL completa da imagem
    const fotoUrl = `${process.env.BASE_URL ?? 'http://localhost:3000'}/${file.path.replace(/\\/g, '/')}`;

    return {
      message: 'Foto de perfil atualizada com sucesso',
      fotoPerfilUrl: fotoUrl,
    };
  }
}