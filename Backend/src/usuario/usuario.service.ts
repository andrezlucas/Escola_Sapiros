import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario, Role } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Turma } from '../turma/entities/turma.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Aluno } from '../aluno/entities/aluno.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Turma)
    private readonly turmaRepository: Repository<Turma>,

    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,

    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
  ) {}

  async findAll(): Promise<Omit<Usuario, 'senha'>[]> {
    const usuarios = await this.usuarioRepository.find();
    return usuarios.map(({ senha, ...resto }) => resto);
  }

  async findOne(id: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return usuario;
  }

  async findByRole(role: Role): Promise<Omit<Usuario, 'senha'>[]> {
    const usuarios = await this.usuarioRepository.find({ where: { role } });
    return usuarios.map(({ senha, ...resto }) => resto);
  }

  async create(dto: CreateUsuarioDto): Promise<Omit<Usuario, 'senha'>> {
    const senhaPadrao = 'Sapiros@123';

    if ((dto as any).senha === senhaPadrao) {
      throw new BadRequestException(
        'A senha padrão não pode ser usada no cadastro.',
      );
    }

    const salt = await bcrypt.genSalt();
    const senhaHash = await bcrypt.hash(senhaPadrao, salt);

    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 180);

    const novoUsuario = this.usuarioRepository.create({
      ...dto,
      senha: senhaHash,
      senhaExpiraEm: dataExpiracao,
    });

    const salvo = await this.usuarioRepository.save(novoUsuario);
    const { senha, ...resto } = salvo;
    return resto;
  }

  async update(
    id: string,
    dto: UpdateUsuarioDto,
  ): Promise<Omit<Usuario, 'senha'>> {
    const usuario = await this.findOne(id);

    if (dto.senha) {
      const senhaPadrao = 'Sapiros@123';

      if (dto.senha === senhaPadrao) {
        throw new BadRequestException('A senha padrão não pode ser usada.');
      }

      const salt = await bcrypt.genSalt();
      dto.senha = await bcrypt.hash(dto.senha, salt);

      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + 180);
      dto.senhaExpiraEm = dataExpiracao;
    }

    Object.assign(usuario, dto);
    const salvo = await this.usuarioRepository.save(usuario);
    const { senha, ...resto } = salvo;
    return resto;
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.findOne(id);
    await this.usuarioRepository.remove(usuario);
  }

  async findByCpfOrEmail(identifier: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({
      where: [{ cpf: identifier }, { email: identifier }],
    });
  }

  async setBlocked(id: string, isBlocked: boolean): Promise<Usuario> {
    const usuario = await this.findOne(id);
    usuario.isBlocked = isBlocked;

    if (isBlocked) {
      // 🔹 Se for PROFESSOR → remove das turmas
      if (usuario.role === Role.PROFESSOR) {
        const professor = await this.professorRepository.findOne({
          where: { usuario: { id: usuario.id } },
        });

        if (professor) {
          await this.turmaRepository
            .createQueryBuilder()
            .update(Turma)
            .set({ professor: undefined })
            .where('professor_id = :id', { id: professor.id })
            .execute();
        }
      }

      // 🔹 Se for ALUNO → remove da turma
      if (usuario.role === Role.ALUNO) {
        const aluno = await this.alunoRepository.findOne({
          where: { usuario: { id: usuario.id } },
          relations: ['turma'],
        });

        if (aluno?.turma) {
          aluno.turma = undefined;
          await this.alunoRepository.save(aluno);
        }
      }
    }

    return this.usuarioRepository.save(usuario);
  }

    async updateFotoPerfil(usuarioId: string, caminhoFoto: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    usuario.fotoPerfil = caminhoFoto;
    await this.usuarioRepository.save(usuario);

    return { message: 'Foto de perfil atualizada com sucesso', fotoPerfil: caminhoFoto };
  }
}
