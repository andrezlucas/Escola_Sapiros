import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Material } from './entities/material.entity';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { ListMaterialDto } from './dto/list-material.dto';
import { Professor } from '../professor/entities/professor.entity';
import { Turma } from '../turma/entities/turma.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';
import { OrigemMaterial } from './enums/origem-material.enum';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private readonly materialRepo: Repository<Material>,

    @InjectRepository(Professor)
    private readonly professorRepo: Repository<Professor>,

    @InjectRepository(Turma)
    private readonly turmaRepo: Repository<Turma>,

    @InjectRepository(Disciplina)
    private readonly disciplinaRepo: Repository<Disciplina>,
  ) {}

  async create(
    createMaterialDto: CreateMaterialDto,
    professorId: string,
    file?: Express.Multer.File,
  ): Promise<Material> {
    const professor = await this.professorRepo.findOne({
      where: { id: professorId },
    });

    if (!professor) {
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(path.resolve(file.path));
      }
      throw new NotFoundException('Professor não encontrado');
    }

    // Validar origem vs arquivo
    if (createMaterialDto.origem === OrigemMaterial.LOCAL && !file) {
      throw new BadRequestException(
        'Arquivo obrigatório para materiais de origem LOCAL',
      );
    }

    if (createMaterialDto.origem === OrigemMaterial.URL && !createMaterialDto.url) {
      throw new BadRequestException('URL obrigatória para materiais de origem URL');
    }

    // Validar relações opcionais
    let turma: Turma | undefined;
    let disciplina: Disciplina | undefined;

    if (createMaterialDto.turmaId) {
      turma = await this.turmaRepo.findOne({
        where: { id: createMaterialDto.turmaId },
      });
      if (!turma) {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(path.resolve(file.path));
        }
        throw new NotFoundException('Turma não encontrada');
      }
    }

    if (createMaterialDto.disciplinaId) {
      disciplina = await this.disciplinaRepo.findOne({
        where: { id_disciplina: createMaterialDto.disciplinaId },
      });
      if (!disciplina) {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(path.resolve(file.path));
        }
        throw new NotFoundException('Disciplina não encontrada');
      }
    }

    const material = this.materialRepo.create({
      titulo: createMaterialDto.titulo,
      descricao: createMaterialDto.descricao,
      tipo: createMaterialDto.tipo,
      origem: createMaterialDto.origem,
      url: createMaterialDto.url,
      filePath: file?.filename,
      mimeType: file?.mimetype,
      tamanho: file?.size,
      professor,
      turma,
      disciplina,
    });

    return this.materialRepo.save(material);
  }

  async findAll(filters: ListMaterialDto): Promise<any[]> {
    const query = this.materialRepo.createQueryBuilder('material')
      .leftJoinAndSelect('material.professor', 'professor')
      .leftJoinAndSelect('professor.usuario', 'usuario')
      .leftJoinAndSelect('material.turma', 'turma')
      .leftJoinAndSelect('material.disciplina', 'disciplina');

    if (filters.turmaId) {
      query.andWhere('material.turma_id = :turmaId', { turmaId: filters.turmaId });
    }

    if (filters.disciplinaId) {
      query.andWhere('material.disciplina_id = :disciplinaId', {
        disciplinaId: filters.disciplinaId,
      });
    }

    if (filters.tipo) {
      query.andWhere('material.tipo = :tipo', { tipo: filters.tipo });
    }

    const materiais = await query.getMany();

    const baseUrl = 'http://localhost:3000/uploads';

    return materiais.map((material) => ({
      ...material,
      fileUrl:
        material.origem === OrigemMaterial.LOCAL && material.filePath
          ? `${baseUrl}/${material.filePath}`
          : null,
    }));
  }

  async findOne(id: string): Promise<any> {
    const material = await this.materialRepo.findOne({
      where: { id },
      relations: ['professor', 'professor.usuario', 'turma', 'disciplina'],
    });

    if (!material) {
      throw new NotFoundException('Material não encontrado');
    }

    const baseUrl = 'http://localhost:3000/uploads';

    return {
      ...material,
      fileUrl:
        material.origem === OrigemMaterial.LOCAL && material.filePath
          ? `${baseUrl}/${material.filePath}`
          : null,
    };
  }

  async update(
    id: string,
    updateMaterialDto: UpdateMaterialDto,
    file?: Express.Multer.File,
  ): Promise<Material> {
    const material = await this.materialRepo.findOne({
      where: { id },
      relations: ['professor'],
    });

    if (!material) {
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(path.resolve(file.path));
      }
      throw new NotFoundException('Material não encontrado');
    }

    // Atualizar relações se fornecidas
    if (updateMaterialDto.turmaId !== undefined) {
      if (updateMaterialDto.turmaId) {
        const turma = await this.turmaRepo.findOne({
          where: { id: updateMaterialDto.turmaId },
        });
        if (!turma) {
          if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(path.resolve(file.path));
          }
          throw new NotFoundException('Turma não encontrada');
        }
        material.turma = turma;
      } else {
        material.turma = null;
      }
    }

    if (updateMaterialDto.disciplinaId !== undefined) {
      if (updateMaterialDto.disciplinaId) {
        const disciplina = await this.disciplinaRepo.findOne({
          where: { id_disciplina: updateMaterialDto.disciplinaId },
        });
        if (!disciplina) {
          if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(path.resolve(file.path));
          }
          throw new NotFoundException('Disciplina não encontrada');
        }
        material.disciplina = disciplina;
      } else {
        material.disciplina = null;
      }
    }

    // Se mudou para LOCAL e veio arquivo, substituir
    if (file) {
      if (material.filePath && fs.existsSync(path.resolve('./uploads', material.filePath))) {
        fs.unlinkSync(path.resolve('./uploads', material.filePath));
      }
      material.filePath = file.filename;
      material.mimeType = file.mimetype;
      material.tamanho = file.size;
      material.origem = OrigemMaterial.LOCAL;
      material.url = null;
    }

    // Atualizar campos do DTO
    if (updateMaterialDto.titulo !== undefined) {
      material.titulo = updateMaterialDto.titulo;
    }
    if (updateMaterialDto.descricao !== undefined) {
      material.descricao = updateMaterialDto.descricao;
    }
    if (updateMaterialDto.tipo !== undefined) {
      material.tipo = updateMaterialDto.tipo;
    }
    if (updateMaterialDto.origem !== undefined) {
      material.origem = updateMaterialDto.origem;
    }
    if (updateMaterialDto.url !== undefined) {
      material.url = updateMaterialDto.url;
    }

    return this.materialRepo.save(material);
  }

  async remove(id: string): Promise<void> {
    const material = await this.materialRepo.findOne({
      where: { id },
    });

    if (!material) {
      throw new NotFoundException('Material não encontrado');
    }

    // Remover arquivo físico se for LOCAL
    if (
      material.origem === OrigemMaterial.LOCAL &&
      material.filePath &&
      fs.existsSync(path.resolve('./uploads', material.filePath))
    ) {
      fs.unlinkSync(path.resolve('./uploads', material.filePath));
    }

    await this.materialRepo.remove(material);
  }
}
