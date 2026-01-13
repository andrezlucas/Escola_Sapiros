import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario, Role } from '../usuario/entities/usuario.entity';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Professor } from '../professor/entities/professor.entity';
import { Coordenacao } from '../coordenacao/entities/coordenacao.entity';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { gerarCodigoReserva } from '../shared/security/codigo-reserva.util';
import { ILike } from 'typeorm';

@Injectable()
export class ConfiguracoesService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,

    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,

    @InjectRepository(Coordenacao)
    private readonly coordenacaoRepository: Repository<Coordenacao>,
  ) {}

  async getPerfil(usuarioId: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    let perfil: any = null;

    if (usuario.role === Role.ALUNO) {
      perfil = await this.alunoRepository.findOne({
        where: { usuario: { id: usuarioId } },
        relations: ['turma'],
      });
    }

    if (usuario.role === Role.PROFESSOR) {
      perfil = await this.professorRepository.findOne({
        where: { usuario: { id: usuarioId } },
        relations: ['disciplinas'],
      });
    }

    if (usuario.role === Role.COORDENACAO) {
      perfil = await this.coordenacaoRepository.findOne({
        where: { usuario: { id: usuarioId } },
      });
    }

    return {
      usuario: {
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone,
        role: usuario.role,
      },
      perfil,
    };
  }

  async updatePerfil(usuarioId: string, dto: UpdatePerfilDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (dto.nome !== undefined) usuario.nome = dto.nome;
    if (dto.email !== undefined) usuario.email = dto.email;
    if (dto.telefone !== undefined) usuario.telefone = dto.telefone;

    if (dto.senha) {
      usuario.senha = await bcrypt.hash(dto.senha, 10);
      usuario.senhaAtualizadaEm = new Date();

      const expira = new Date();
      expira.setMonth(expira.getMonth() + 6);
      usuario.senhaExpiraEm = expira;

      usuario.tokenVersion += 1;
    }

    await this.usuarioRepository.save(usuario);

    return { message: 'Perfil atualizado com sucesso' };
  }

  async aceitarTermos(usuarioId: string, aceito: boolean) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (aceito) {
      usuario.termosAceitos = true;
      usuario.termosAceitosEm = new Date();
    }

    await this.usuarioRepository.save(usuario);

    return {
      termosAceitos: usuario.termosAceitos,
      termosAceitosEm: usuario.termosAceitosEm,
    };
  }

  async getStatusTermos(usuarioId: string) {
  const usuario = await this.usuarioRepository.findOne({
    where: { id: usuarioId },
    select: ['termosAceitos', 'termosAceitosEm'],
  });

  if (!usuario) {
    throw new NotFoundException('Usuário não encontrado');
  }

  return {
    termosAceitos: usuario.termosAceitos,
    termosAceitosEm: usuario.termosAceitosEm,
  };
}


  async getPrivacidade(usuarioId: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      email: usuario.email,
      telefone: usuario.telefone,
      twoFactorEnabled: usuario.twoFactorEnabled,
      ultimoLoginEm: usuario.ultimoLoginEm,
      ultimoLoginIp: usuario.ultimoLoginIp,
      codigosReserva: {
        restantes: usuario.codigosReserva?.filter(c => !c.usado).length ?? 0,
        total: 10,
      },
    };
  }


  async logoutTodos(usuarioId: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    usuario.tokenVersion += 1;
    await this.usuarioRepository.save(usuario);

    return { message: 'Todos os dispositivos foram desconectados' };
  }

  async gerarCodigoAcesso(usuarioId: string) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const codigos = Array.from({ length: 10 }).map(() =>
      gerarCodigoReserva(),
    );

    usuario.codigosReserva = await Promise.all(
      codigos.map(async codigo => ({
        codigo: await bcrypt.hash(codigo, 10),
        usado: false,
      })),
    );

    await this.usuarioRepository.save(usuario);

    return { codigos };
  }

  async listarCodigosAcesso(usuarioId: string) {
  const usuario = await this.usuarioRepository.findOne({
    where: { id: usuarioId },
  });

  if (!usuario) {
    throw new NotFoundException('Usuário não encontrado');
  }

  const codigos = usuario.codigosReserva ?? [];

  return {
    total: codigos.length,
    usados: codigos.filter(c => c.usado).length,
    restantes: codigos.filter(c => !c.usado).length,
    detalhes: codigos.map(c => ({
      usado: c.usado,
      usadoEm: c.usadoEm ?? null,
    })),
  };
}

 async listarUsuarios(
  page: number = 1,
  limit: number = 10,
  search?: string,
  role?: Role,
  status?: 'ativo' | 'inativo', // agora recebe strings
) {
  const skip = (page - 1) * limit;

  const queryBuilder = this.usuarioRepository.createQueryBuilder('usuario')
    .leftJoinAndSelect(Aluno, 'aluno', 'aluno.usuario_id = usuario.id')
    .leftJoinAndSelect('professores', 'professor', 'professor.id = usuario.id')
    .select([
      'usuario.id',
      'usuario.nome',
      'usuario.email',
      'usuario.role',
      'usuario.isBlocked',
      'usuario.ultimoLoginEm',
      'aluno.matriculaAluno',
    ])
    .take(limit)
    .skip(skip)
    .orderBy('usuario.nome', 'ASC');

  // Filtro de busca (case-insensitive)
  if (search) {
    queryBuilder.andWhere(
      '(LOWER(usuario.nome) LIKE :search OR LOWER(usuario.email) LIKE :search)',
      { search: `%${search.toLowerCase()}%` },
    );
  }

  // Filtro por role
  if (role) {
    queryBuilder.andWhere('usuario.role = :role', { role });
  }

  // Filtro de status (ativo/inativo)
  if (status) {
    if (status === 'ativo') {
      queryBuilder.andWhere('usuario.isBlocked = false');
    } else if (status === 'inativo') {
      queryBuilder.andWhere('usuario.isBlocked = true');
    }
  }

  const [usuarios, total] = await queryBuilder.getManyAndCount();

  const data = usuarios.map((u: any) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    role: u.role,
    status: u.isBlocked ? 'Inativo' : 'Ativo',
    ultimoAcesso: u.ultimoLoginEm,
    matricula: u.role === Role.ALUNO ? u.aluno?.matriculaAluno : u.id.split('-')[0].toUpperCase(),
  }));

  return {
    data,
    meta: {
      total,
      page,
      lastPage: Math.ceil(total / limit),
    },
  };
}


  // -------------------------------
  // Método para alternar status
  // -------------------------------
  async alternarStatusUsuario(usuarioId: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    usuario.isBlocked = !usuario.isBlocked;
    await this.usuarioRepository.save(usuario);

    return { message: `Usuário ${usuario.isBlocked ? 'bloqueado' : 'desbloqueado'} com sucesso` };
  }


}
