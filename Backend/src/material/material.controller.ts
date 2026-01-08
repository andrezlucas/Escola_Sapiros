import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import type { Request } from 'express';

import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ListMaterialDto } from './dto/list-material.dto';

import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { SenhaExpiradaGuard } from '../auth/senha-expirada/senha-expirada.guard';

import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { storageConfig } from '../upload/upload.config';
import { OrigemMaterial } from './enums/origem-material.enum';

type AuthRequest = Request & {
  user: Usuario & { tipo: Role };
};

@UseGuards(JwtAuthGuard, RolesGuard, SenhaExpiradaGuard)
@Controller('materiais')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @Roles(Role.PROFESSOR, Role.COORDENACAO)
  @UseInterceptors(FileInterceptor('file', storageConfig))
  async create(
    @Body(new ValidationPipe({ transform: true })) dto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    try {
      if (dto.origem === OrigemMaterial.LOCAL && !file) {
        throw new BadRequestException('Arquivo obrigatório para origem LOCAL');
      }

      if (dto.origem === OrigemMaterial.URL && !dto.url) {
        throw new BadRequestException('URL obrigatória para origem URL');
      }

      return await this.materialService.create(
        dto,
        req.user.id,
        file,
      );
    } catch (error) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }
@Get()
async findAll(
  @Req() req: AuthRequest,
  @Query(new ValidationPipe({ transform: true })) filters: ListMaterialDto,
) {
  return this.materialService.findAll(
    req.user.id,
    req.user.role, // Alterado de 'tipo' para 'role' para bater com a Entity
    filters,
  );
}

@Get(':id')
async findOne(
  @Param('id') id: string,
  @Req() req: AuthRequest,
) {
  return this.materialService.findOne(
    id,
    req.user.id,
    req.user.role // Usando o campo correto da entidade
  );
}

  @Patch(':id')
  @Roles(Role.PROFESSOR, Role.COORDENACAO)
  @UseInterceptors(FileInterceptor('file', storageConfig))
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      return await this.materialService.update(id, dto, file);
    } catch (error) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Delete(':id')
  @Roles(Role.PROFESSOR, Role.COORDENACAO)
  async remove(
    @Param('id') id: string,
  ) {
    await this.materialService.remove(id);
    return { message: 'Material removido com sucesso' };
  }
}

