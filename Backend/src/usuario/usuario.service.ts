import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, Role } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  // Listar todos os usuários (sem senha)
  async findAll(): Promise<Omit<Usuario, 'senha'>[]> {
    const usuarios = await this.usuarioRepository.find();
    return usuarios.map(u => {
      const { senha, ...resto } = u;
      return resto;
    });
  }

  // Buscar usuário por ID (UUID)
  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  // Buscar usuários por role
  async findByRole(role: Role): Promise<Omit<Usuario, 'senha'>[]> {
    const usuarios = await this.usuarioRepository.find({ where: { role } });
    return usuarios.map(u => {
      const { senha, ...resto } = u;
      return resto;
    });
  }

  // Criar usuário (com hash de senha)
  async create(dto: CreateUsuarioDto): Promise<Omit<Usuario, 'senha'>> {
    const salt = await bcrypt.genSalt();
    const senhaHash = await bcrypt.hash(dto.senha, salt);

    const novoUsuario = this.usuarioRepository.create({
      ...dto,
      senha: senhaHash,
    });

    const salvo = await this.usuarioRepository.save(novoUsuario);
    const { senha, ...resto } = salvo;
    return resto;
  }

  // Atualizar usuário
  async update(id: string, dto: UpdateUsuarioDto): Promise<Omit<Usuario, 'senha'>> {
    const usuario = await this.findOne(id);

    if (dto.senha) {
      const salt = await bcrypt.genSalt();
      dto.senha = await bcrypt.hash(dto.senha, salt);
    }

    Object.assign(usuario, dto);
    const salvo = await this.usuarioRepository.save(usuario);
    const { senha, ...resto } = salvo;
    return resto;
  }

  // Remover usuário
  async remove(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }

  // Buscar por CPF ou Email
  async findByCpfOrEmail(identifier: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: [{ cpf: identifier }, { email: identifier }],
    });
  }
}
