import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
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
    dto: CreateMaterialDto,
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

    if (dto.origem === OrigemMaterial.LOCAL && !file) {
      throw new BadRequestException('Arquivo obrigatório para origem LOCAL');
    }

    if (dto.origem === OrigemMaterial.URL && !dto.url) {
      throw new BadRequestException('URL obrigatória para origem URL');
    }

    let turma: Turma | undefined;
    let disciplina: Disciplina | undefined;

    if (dto.turmaId) {
      const turmaEncontrada = await this.turmaRepo.findOne({
        where: { id: dto.turmaId },
      });
      if (!turmaEncontrada) {
        this.cleanupFile(file?.path);
        throw new NotFoundException('Turma não encontrada');
      }
      turma = turmaEncontrada;
    }

    if (dto.disciplinaId) {
      const disciplinaEncontrada = await this.disciplinaRepo.findOne({
        where: { id_disciplina: dto.disciplinaId },
      });
      if (!disciplinaEncontrada) {
        this.cleanupFile(file?.path);
        throw new NotFoundException('Disciplina não encontrada');
      }
      disciplina = disciplinaEncontrada;
    }

    const material = this.materialRepo.create({
      ...dto,
      filePath: file?.filename,
      mimeType: file?.mimetype,
      tamanho: file?.size,
      professor,
      turma,
      disciplina,
    });

    return this.materialRepo.save(material);
  }

  async findAll(
    userId: string,
    role: 'ALUNO' | 'PROFESSOR',
    filters: ListMaterialDto,
  ): Promise<any[]> {
    const query = this.materialRepo
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.professor', 'professor')
      .leftJoinAndSelect('professor.usuario', 'usuario')
      .leftJoinAndSelect('material.turma', 'turma')
      .leftJoinAndSelect('material.disciplina', 'disciplina')
      .orderBy('material.criadoEm', 'DESC');

    if (role === 'ALUNO') {
      query
        .innerJoin('turma.alunos', 'aluno')
        .andWhere('aluno.id = :userId', { userId });
    }

    if (role === 'PROFESSOR') {
      query.andWhere(
        '(professor.id = :userId OR turma.professor_id = :userId)',
        { userId },
      );
    }

    if (filters.turmaId) {
      query.andWhere('turma.id = :turmaId', { turmaId: filters.turmaId });
    }

    if (filters.disciplinaId) {
      query.andWhere('disciplina.id_disciplina = :disciplinaId', {
        disciplinaId: filters.disciplinaId,
      });
    }

    if (filters.tipo) {
      query.andWhere('material.tipo = :tipo', { tipo: filters.tipo });
    }

    const materiais = await query.getMany();

    return materiais.map((m) => ({
      ...m,
      fileUrl:
        m.origem === OrigemMaterial.LOCAL && m.filePath
          ? `${this.baseUrl}/uploads/${m.filePath}`
          : m.url,
      instructorName: m.professor?.usuario?.nome || 'N/A',
      disciplineName: m.disciplina?.nome_disciplina || 'Geral',
    }));
  }

  async findOne(
    id: string,
    userId: string,
    role: 'ALUNO' | 'PROFESSOR',
  ): Promise<any> {
    const material = await this.materialRepo
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.professor', 'professor')
      .leftJoinAndSelect('professor.usuario', 'usuario')
      .leftJoinAndSelect('material.turma', 'turma')
      .leftJoinAndSelect('turma.alunos', 'alunos')
      .leftJoinAndSelect('material.disciplina', 'disciplina')
      .where('material.id = :id', { id })
      .getOne();

    if (!material) {
      throw new NotFoundException('Material não encontrado');
    }

    if (role === 'ALUNO') {
      const permitido = material.turma?.alunos?.some(
        (aluno) => aluno.id === userId,
      );
      if (!permitido) {
        throw new ForbiddenException('Acesso negado');
      }
    }

    if (role === 'PROFESSOR') {
      const permitido =
        material.professor?.id === userId ||
        material.turma?.professor?.id === userId;

      if (!permitido) {
        throw new ForbiddenException('Acesso negado');
      }
    }

    return {
      ...material,
      fileUrl:
        material.origem === OrigemMaterial.LOCAL && material.filePath
          ? `${this.baseUrl}/uploads/${material.filePath}`
          : material.url,
    };
  }

  async update(
    id: string,
    dto: UpdateMaterialDto,
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

    if (dto.turmaId !== undefined) {
      if (dto.turmaId) {
        const turma = await this.turmaRepo.findOne({
          where: { id: dto.turmaId },
        });
        if (!turma) {
          this.cleanupFile(file?.path);
          throw new NotFoundException('Turma não encontrada');
        }
        material.turma = turma;
      } else {
        material.turma = undefined;
      }
    }

    if (dto.disciplinaId !== undefined) {
      if (dto.disciplinaId) {
        const disciplina = await this.disciplinaRepo.findOne({
          where: { id_disciplina: dto.disciplinaId },
        });
        if (!disciplina) {
          this.cleanupFile(file?.path);
          throw new NotFoundException('Disciplina não encontrada');
        }
        material.disciplina = disciplina;
      } else {
        material.disciplina = undefined;
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
      material.url = undefined;
    } else if (dto.origem === OrigemMaterial.URL) {
      if (material.filePath) {
        this.cleanupFile(path.resolve('./uploads', material.filePath));
      }
      material.filePath = undefined;
      material.mimeType = undefined;
      material.tamanho = undefined;
    }

    Object.assign(material, dto);
    return this.materialRepo.save(material);
  }

  async remove(id: string): Promise<void> {
    const material = await this.materialRepo.findOne({ where: { id } });

    if (!material) {
      throw new NotFoundException('Material não encontrado');
    }

    if (material.filePath) {
      this.cleanupFile(path.resolve('./uploads', material.filePath));
    }

    await this.materialRepo.remove(material);
  }

  private cleanupFile(filePath?: string) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

