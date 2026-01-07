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
import { MaterialService } from './material.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ListMaterialDto } from './dto/list-material.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { SenhaExpiradaGuard } from '../auth/senha-expirada/senha-expirada.guard';
import { storageConfig } from '../upload/upload.config';
import { OrigemMaterial } from './enums/origem-material.enum';
import type { Request } from 'express';

type AuthRequest = Request & {
  user?: Usuario | { id: string; role: Role } | any;
};

@UseGuards(JwtAuthGuard, RolesGuard, SenhaExpiradaGuard)
@Controller('materiais')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Post()
  @Roles(Role.PROFESSOR, Role.COORDENACAO)
  @UseInterceptors(FileInterceptor('file', storageConfig))
  async create(
    @Body(new ValidationPipe({ transform: true })) createMaterialDto: CreateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthRequest,
  ) {
    const professorId = req.user.id;

    // Validar origem vs arquivo
    if (createMaterialDto.origem === OrigemMaterial.LOCAL && !file) {
      throw new BadRequestException(
        'Arquivo obrigatório para materiais de origem LOCAL',
      );
    }

    if (createMaterialDto.origem === OrigemMaterial.URL && !createMaterialDto.url) {
      throw new BadRequestException(
        'URL obrigatória para materiais de origem URL',
      );
    }

    return this.materialService.create(createMaterialDto, professorId, file);
  }

  @Get()
  async findAll(
    @Query(new ValidationPipe({ transform: true })) filters: ListMaterialDto,
  ) {
    return this.materialService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.materialService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.PROFESSOR, Role.COORDENACAO)
  @UseInterceptors(FileInterceptor('file', storageConfig))
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true })) updateMaterialDto: UpdateMaterialDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.materialService.update(id, updateMaterialDto, file);
  }

  @Delete(':id')
  @Roles(Role.PROFESSOR, Role.COORDENACAO)
  async remove(@Param('id') id: string) {
    await this.materialService.remove(id);
    return { message: 'Material removido com sucesso' };
  }
}
