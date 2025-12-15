import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Professor } from './entities/professor.entity';
import { Usuario, Role } from '../usuario/entities/usuario.entity';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';

@Injectable()
export class ProfessorService {
  constructor(
    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateProfessorDto): Promise<Professor> {
    const {
      nome,
      email,
      cpf,
      telefone,
      sexo,
      data_nascimento,
      enderecoLogradouro,
      enderecoNumero,
      enderecoCep,
      enderecoComplemento,
      enderecoBairro,
      enderecoEstado,
      enderecoCidade,
      cursoGraduacao,
      instituicao,
      dataInicioGraduacao,
      dataConclusaoGraduacao,
    } = createDto;

    const where = email ? [{ cpf }, { email }] : [{ cpf }];
    const exists = await this.usuarioRepository.findOne({ where });

    if (exists) {
      throw new ConflictException('CPF ou Email já cadastrado');
    }

    return this.dataSource.transaction(async (manager) => {
      const usuario = manager.create(Usuario, {
        nome,
        email,
        cpf,
        telefone,
        sexo,
        dataNascimento: new Date(data_nascimento),
        enderecoLogradouro,
        enderecoNumero,
        enderecoCep,
        enderecoComplemento,
        enderecoBairro,
        enderecoEstado,
        enderecoCidade,
        senha: await bcrypt.hash('Sapiros@123', 10),
        role: Role.PROFESSOR,
      });

      const usuarioSalvo = await manager.save(usuario);

      const professor = manager.create(Professor, {
        id: usuarioSalvo.id,
        usuario: usuarioSalvo,
        graduacao: cursoGraduacao,
        instituicao,
        dataInicioGraduacao: new Date(dataInicioGraduacao),
        dataConclusaoGraduacao: dataConclusaoGraduacao
          ? new Date(dataConclusaoGraduacao)
          : undefined,
      });

      return await manager.save(professor);
    });
  }

  async findAll(): Promise<Professor[]> {
    return this.professorRepository.find({
      relations: ['usuario', 'turmas', 'disciplinas'],
    });
  }

  async findOne(id: string): Promise<Professor> {
    const professor = await this.professorRepository.findOne({
      where: { id },
      relations: ['usuario', 'turmas', 'disciplinas'],
    });

    if (!professor) {
      throw new NotFoundException('Professor não encontrado');
    }

    return professor;
  }

 async update(id: string, updateDto: UpdateProfessorDto): Promise<Professor> {
  return this.dataSource.transaction(async (manager) => {
    const professor = await manager.findOne(Professor, {
      where: { id },
      relations: ['usuario'],
    });

    if (!professor) {
      throw new NotFoundException('Professor não encontrado');
    }

    const usuario = professor.usuario;

    Object.assign(usuario, {
      nome: updateDto.nome ?? usuario.nome,
      email: updateDto.email ?? usuario.email,
      cpf: updateDto.cpf ?? usuario.cpf,
      telefone: updateDto.telefone ?? usuario.telefone,
      sexo: updateDto.sexo ?? usuario.sexo,
      enderecoLogradouro:
        updateDto.enderecoLogradouro ?? usuario.enderecoLogradouro,
      enderecoNumero:
        updateDto.enderecoNumero ?? usuario.enderecoNumero,
      enderecoCep: updateDto.enderecoCep ?? usuario.enderecoCep,
      enderecoComplemento:
        updateDto.enderecoComplemento ?? usuario.enderecoComplemento,
      enderecoBairro:
        updateDto.enderecoBairro ?? usuario.enderecoBairro,
      enderecoEstado:
        updateDto.enderecoEstado ?? usuario.enderecoEstado,
      enderecoCidade:
        updateDto.enderecoCidade ?? usuario.enderecoCidade,
    });

    if (updateDto.data_nascimento) {
      usuario.dataNascimento = new Date(updateDto.data_nascimento);
    }

    Object.assign(professor, {
      graduacao: updateDto.cursoGraduacao ?? professor.graduacao,
      instituicao: updateDto.instituicao ?? professor.instituicao,
      dataInicioGraduacao: updateDto.dataInicioGraduacao
        ? new Date(updateDto.dataInicioGraduacao)
        : professor.dataInicioGraduacao,
      dataConclusaoGraduacao: updateDto.dataConclusaoGraduacao
        ? new Date(updateDto.dataConclusaoGraduacao)
        : professor.dataConclusaoGraduacao,
    });

    await manager.save(usuario);
    return manager.save(professor);
  });
}


  async remove(id: string): Promise<void> {
    const professor = await this.findOne(id);
    await this.professorRepository.remove(professor);
  }
}
