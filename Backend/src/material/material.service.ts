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
  private readonly baseUrl = process.env.APP_URL || 'http://localhost:3000';

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
      this.cleanupFile(file?.path);
      throw new NotFoundException('Professor não encontrado');
    }

    if (createMaterialDto.origem === OrigemMaterial.LOCAL && !file) {
      throw new BadRequestException('Arquivo obrigatório para origem LOCAL');
    }

    if (createMaterialDto.origem === OrigemMaterial.URL && !createMaterialDto.url) {
      throw new BadRequestException('URL obrigatória para origem URL');
    }

    let turma: Turma | null = null;
    let disciplina: Disciplina | null = null;

    if (createMaterialDto.turmaId) {
      turma = await this.turmaRepo.findOne({ where: { id: createMaterialDto.turmaId } });
      if (!turma) {
        this.cleanupFile(file?.path);
        throw new NotFoundException('Turma não encontrada');
      }
    }

    if (createMaterialDto.disciplinaId) {
      disciplina = await this.disciplinaRepo.findOne({ 
        where: { id_disciplina: createMaterialDto.disciplinaId } 
      });
      if (!disciplina) {
        this.cleanupFile(file?.path);
        throw new NotFoundException('Disciplina não encontrada');
      }
    }

    const material = this.materialRepo.create({
      ...createMaterialDto,
      filePath: file?.filename,
      mimeType: file?.mimetype,
      tamanho: file?.size,
      professor,
      turma: turma ?? undefined,
      disciplina: disciplina ?? undefined,
    });

    return this.materialRepo.save(material);
  }

  async findAll(filters: ListMaterialDto): Promise<any[]> {
    const query = this.materialRepo.createQueryBuilder('material')
      .leftJoinAndSelect('material.professor', 'professor')
      .leftJoinAndSelect('professor.usuario', 'usuario')
      .leftJoinAndSelect('material.turma', 'turma')
      .leftJoinAndSelect('material.disciplina', 'disciplina')
      .orderBy('material.criadoEm', 'DESC');

    if (filters.turmaId) {
      query.andWhere('material.turma_id = :turmaId', { turmaId: filters.turmaId });
    }

    if (filters.disciplinaId) {
      query.andWhere('material.disciplina_id = :disciplinaId', { disciplinaId: filters.disciplinaId });
    }

    if (filters.tipo) {
      query.andWhere('material.tipo = :tipo', { tipo: filters.tipo });
    }

    const materiais = await query.getMany();

    return materiais.map((m) => ({
      ...m,
      fileUrl: m.origem === OrigemMaterial.LOCAL && m.filePath
          ? `${this.baseUrl}/uploads/${m.filePath}`
          : m.url,
      instructorName: m.professor?.usuario?.nome || 'N/A',
      disciplineName: m.disciplina?.nome_disciplina || 'Geral',
    }));
  }

  async findOne(id: string): Promise<any> {
    const material = await this.materialRepo.findOne({
      where: { id },
      relations: ['professor', 'professor.usuario', 'turma', 'disciplina'],
    });

    if (!material) throw new NotFoundException('Material não encontrado');

    return {
      ...material,
      fileUrl: material.origem === OrigemMaterial.LOCAL && material.filePath
          ? `${this.baseUrl}/uploads/${material.filePath}`
          : material.url,
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
      this.cleanupFile(file?.path);
      throw new NotFoundException('Material não encontrado');
    }

    if (updateMaterialDto.turmaId !== undefined) {
      if (updateMaterialDto.turmaId) {
        const turma = await this.turmaRepo.findOne({ where: { id: updateMaterialDto.turmaId } });
        if (!turma) {
          this.cleanupFile(file?.path);
          throw new NotFoundException('Turma não encontrada');
        }
        material.turma = turma;
      } else {
        material.turma = null as any;
      }
    }

    if (updateMaterialDto.disciplinaId !== undefined) {
      if (updateMaterialDto.disciplinaId) {
        const disciplina = await this.disciplinaRepo.findOne({ 
          where: { id_disciplina: updateMaterialDto.disciplinaId } 
        });
        if (!disciplina) {
          this.cleanupFile(file?.path);
          throw new NotFoundException('Disciplina não encontrada');
        }
        material.disciplina = disciplina;
      } else {
        material.disciplina = null as any;
      }
    }

    if (file) {
      if (material.filePath) {
        this.cleanupFile(path.resolve('./uploads', material.filePath));
      }
      material.filePath = file.filename;
      material.mimeType = file.mimetype;
      material.tamanho = file.size;
      material.origem = OrigemMaterial.LOCAL;
      material.url = null as any;
    } else if (updateMaterialDto.origem === OrigemMaterial.URL) {
        if (material.filePath) {
            this.cleanupFile(path.resolve('./uploads', material.filePath));
            material.filePath = null as any;
            material.mimeType = null as any;
            material.tamanho = null as any;
        }
    }

    Object.assign(material, updateMaterialDto);
    return this.materialRepo.save(material);
  }

  async remove(id: string): Promise<void> {
    const material = await this.materialRepo.findOne({ where: { id } });
    if (!material) throw new NotFoundException('Material não encontrado');

    if (material.filePath) {
      this.cleanupFile(path.resolve('./uploads', material.filePath));
    }

    await this.materialRepo.remove(material);
  }

  private cleanupFile(filePath?: string) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(path.resolve(filePath));
    }
  }
}