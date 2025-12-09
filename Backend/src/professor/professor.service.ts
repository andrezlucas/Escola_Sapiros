import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, DataSource } from 'typeorm';
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
    private dataSource: DataSource,
  ) {}

  async create(createDto: CreateProfessorDto): Promise<Professor> {
    const { nome, email, cpf, registroFuncional, cargaHoraria, cargo } = createDto;

    const exists = await this.usuarioRepository.findOne({
      where: [{ cpf: cpf }, { email: email }],
    });
    if (exists) throw new ConflictException('CPF ou Email já cadastrado');

    const professorExists = await this.professorRepository.findOne({ where: { registroFuncional } });
    if (professorExists) throw new ConflictException('Registro Funcional já cadastrado');

    return this.dataSource.transaction(async (manager) => {
      // 1. Criar o Usuário base
      const userData: DeepPartial<Usuario> = {
        nome: nome,
        email: email,
        cpf: cpf,
        senha: await bcrypt.hash('Sapiros@123', 10),
        role: Role.PROFESSOR,
      };

      const novoUsuario = manager.create(Usuario, userData);
      const usuarioSalvo = await manager.save(Usuario, novoUsuario);

      // 2. Criar o Professor (JTI Manual)
      const professorData: DeepPartial<Professor> = {
        id: usuarioSalvo.id,
        usuario: usuarioSalvo,
        registroFuncional: registroFuncional,
        cargaHoraria: cargaHoraria || 0,
        cargo: cargo,
      };
      
      const novoProfessor = manager.create(Professor, professorData);

      return await manager.save(Professor, novoProfessor);
    });
  }

  async findAll(): Promise<Professor[]> {
    return this.professorRepository.find({ relations: ['usuario', 'turmas'] });
  }

  async findOne(id: string): Promise<Professor> {
    // Busca por 'id' que é a PK/FK do usuário
    const professor = await this.professorRepository.findOne({
      where: { id },
      relations: ['usuario', 'turmas'],
    });
    if (!professor) throw new NotFoundException('Professor não encontrado');
    return professor;
  }

  async update(id: string, updateDto: UpdateProfessorDto): Promise<Professor> {
    const professor = await this.findOne(id);
    const usuario = professor.usuario;

    // 1. Atualizar a tabela base (Usuario)
    if (updateDto.nome) usuario.nome = updateDto.nome;
    if (updateDto.email) usuario.email = updateDto.email;
    if (updateDto.cpf) usuario.cpf = updateDto.cpf;

    await this.usuarioRepository.save(usuario);

    // 2. Atualizar a tabela filha (Professor)
    if (updateDto.registroFuncional) professor.registroFuncional = updateDto.registroFuncional;
    if (updateDto.cargaHoraria !== undefined) professor.cargaHoraria = updateDto.cargaHoraria;
    if (updateDto.cargo) professor.cargo = updateDto.cargo;
    
    return this.professorRepository.save(professor);
  }

  async remove(id: string): Promise<void> {
    const professor = await this.findOne(id);
    await this.professorRepository.remove(professor);
    
    // Deletar o registro na tabela base (Usuario)
    await this.usuarioRepository.delete(id); 
  }
}