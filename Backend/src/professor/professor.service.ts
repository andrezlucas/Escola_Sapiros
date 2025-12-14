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
    const professor = await this.findOne(id);
    const usuario = professor.usuario;

    if (updateDto.nome) usuario.nome = updateDto.nome;
    if (updateDto.email) usuario.email = updateDto.email;
    if (updateDto.cpf) usuario.cpf = updateDto.cpf;
    if (updateDto.telefone) usuario.telefone = updateDto.telefone;
    if (updateDto.sexo) usuario.sexo = updateDto.sexo;

    await this.usuarioRepository.save(usuario);

    if (updateDto.cursoGraduacao)
      professor.graduacao = updateDto.cursoGraduacao;

    if (updateDto.instituicao)
      professor.instituicao = updateDto.instituicao;

    if (updateDto.dataInicioGraduacao)
      professor.dataInicioGraduacao = new Date(
        updateDto.dataInicioGraduacao,
      );

    if (updateDto.dataConclusaoGraduacao)
      professor.dataConclusaoGraduacao = new Date(
        updateDto.dataConclusaoGraduacao,
      );

    return this.professorRepository.save(professor);
  }

  async remove(id: string): Promise<void> {
    const professor = await this.findOne(id);
    await this.professorRepository.remove(professor);
  }
}
