import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Coordenacao } from './entities/coordenacao.entity';
import { CreateCoordenacaoDto } from './dto/create-coordenacao.dto';
import { UpdateCoordenacaoDto } from './dto/update-coordenacao.dto';
import { Usuario, Role } from '../usuario/entities/usuario.entity';

// Função auxiliar para parsear datas (se necessário, inclua aqui se o DTO for usar datas)
const parseDate = (value: string | Date, fieldName: string): Date => {
    if (value instanceof Date) return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) throw new ConflictException(`${fieldName} inválida: "${value}"`);
    return d;
};

@Injectable()
export class CoordenacaoService {
  constructor(
    @InjectRepository(Coordenacao)
    private readonly coordenacaoRepository: Repository<Coordenacao>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private dataSource: DataSource,
  ) {}

  private assertIsCoordenacao(user: any) {
    if (!user) throw new ForbiddenException('Usuário não autenticado');
    if (user.role !== Role.COORDENACAO) {
      throw new ForbiddenException('Apenas usuários com role COORDENACAO podem executar esta ação');
    }
  }

  async create(createDto: CreateCoordenacaoDto): Promise<Coordenacao> {
    const { nome, email, cpf, funcao, ...restoUsuario } = createDto;

    const exists = await this.usuarioRepository.findOne({
      where: [{ cpf: cpf }, { email: email }],
    });
    if (exists) throw new ConflictException('CPF ou Email já cadastrado');

    return this.dataSource.transaction(async (manager) => {
      // 1. Criar o Usuário base (com senha padrão)
      const userData: DeepPartial<Usuario> = {
        nome: nome,
        email: email,
        cpf: cpf,
        senha: await bcrypt.hash('Sapiros@123', 10), // Senha padrão
        role: Role.COORDENACAO,
        // Campos que NÃO estão mais no Usuario, mas são obrigatórios no DB
        // Depende da sua refatoração final do Usuario.entity.ts
      };
      
      const novoUsuario = manager.create(Usuario, userData);
      const usuarioSalvo = await manager.save(Usuario, novoUsuario);

      // 2. Criar a Coordenação (JTI Manual)
      const coordData: DeepPartial<Coordenacao> = {
        id: usuarioSalvo.id,
        usuario: usuarioSalvo,
        funcao: funcao,
      };

      const coord = manager.create(Coordenacao, coordData);
      return await manager.save(Coordenacao, coord);
    });
  }

  async findAll(): Promise<Coordenacao[]> {
    return this.coordenacaoRepository.find({ relations: ['usuario'] });
  }

  async findOne(id: string): Promise<Coordenacao> {
    const coord = await this.coordenacaoRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!coord) throw new NotFoundException(`Coordenacao com ID ${id} não encontrada`);
    return coord;
  }

  async update(id: string, updateDto: UpdateCoordenacaoDto): Promise<Coordenacao> {
    const coord = await this.coordenacaoRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!coord) throw new NotFoundException(`Coordenacao com ID ${id} não encontrada`);

    // 1. Atualizar a tabela base (Usuario)
    const usuario = coord.usuario;
    if (updateDto.nome) usuario.nome = updateDto.nome;
    if (updateDto.email) usuario.email = updateDto.email;

    await this.usuarioRepository.save(usuario);

    // 2. Atualizar a tabela filha (Coordenacao)
    if (updateDto.funcao !== undefined) coord.funcao = updateDto.funcao;

    return this.coordenacaoRepository.save(coord);
  }

  async remove(id: string): Promise<void> {
    const coord = await this.coordenacaoRepository.findOne({
      where: { id },
      relations: ['usuario'],
    });
    if (!coord) throw new NotFoundException(`Coordenacao com ID ${id} não encontrada`);

    await this.coordenacaoRepository.remove(coord);
    await this.usuarioRepository.delete(id);
  }
}