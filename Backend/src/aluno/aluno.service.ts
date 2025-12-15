import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Aluno } from './entities/aluno.entity';
import { Usuario, Role } from '../usuario/entities/usuario.entity';
import { Documentacao } from '../documentacao/entities/documentacao.entity';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';

const parseDate = (value: string | Date, fieldName: string): Date => {
  if (value instanceof Date) return value;

  const d = new Date(value);
  if (isNaN(d.getTime())) {
    throw new ConflictException(`${fieldName} inválida`);
  }
  return d;
};

const parseOptionalDate = (value?: string | Date): Date | undefined => {
  if (!value) return undefined;
  if (value instanceof Date) return value;

  const d = new Date(value);
  return isNaN(d.getTime()) ? undefined : d;
};

@Injectable()
export class AlunoService {
  constructor(
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Documentacao)
    private readonly documentacaoRepository: Repository<Documentacao>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateAlunoDto): Promise<Aluno> {
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: [{ cpf: dto.cpf }, { email: dto.email }],
    });

    if (usuarioExistente) {
      throw new ConflictException('CPF ou Email já cadastrado');
    }

    return this.dataSource.transaction(async (manager) => {
      const usuarioData: DeepPartial<Usuario> = {
        nome: dto.nome,
        email: dto.email,
        cpf: dto.cpf,
        senha: await bcrypt.hash('Sapiros@123', 10),
        role: Role.ALUNO,
        isBlocked: true,
      };

      const usuario = manager.create(Usuario, usuarioData);
      const usuarioSalvo = await manager.save(Usuario, usuario);

      const alunoData: DeepPartial<Aluno> = {
        id: usuarioSalvo.id,
        usuario: usuarioSalvo,

        matriculaAluno: await this.generateMatricula(),
        serieAno: dto.serieAno,
        escolaOrigem: dto.escolaOrigem,

        rgNumero: dto.rgNumero,
        rgDataEmissao: parseDate(dto.rgDataEmissao, 'RG data emissão'),
        rgOrgaoEmissor: dto.rgOrgaoEmissor,

        nacionalidade: dto.nacionalidade,
        naturalidade: dto.naturalidade,

        possuiNecessidadesEspeciais: dto.possuiNecessidadesEspeciais ?? false,
        descricaoNecessidadesEspeciais: dto.descricaoNecessidadesEspeciais,

        possuiAlergias: dto.possuiAlergias ?? false,
        descricaoAlergias: dto.descricaoAlergias,

        autorizacaoSaidaSozinho: dto.autorizacaoSaidaSozinho ?? false,
        autorizacaoUsoImagem: dto.autorizacaoUsoImagem ?? false,

        responsavelNome: dto.responsavelNome,
        responsavelDataNascimento: parseOptionalDate(
          dto.responsavel_Data_Nascimento,
        ),
        responsavel_sexo: dto.responsavel_sexo,
        responsavelNacionalidade: dto.responsavel_nacionalidade,
        responsavelNaturalidade: dto.responsavel_naturalidade,
        responsavelCpf: dto.responsavelCpf,
        responsavelRg: dto.responsavelRg,
        responsavelRgOrgaoEmissor: dto.responsavel_rg_OrgaoEmissor,
        responsavelTelefone: dto.responsavelTelefone,
        responsavelEmail: dto.responsavelEmail,
        responsavelCep: dto.responsavelCep,
        responsavelLogradouro: dto.responsavelLogradouro,
        responsavelNumero: dto.responsavelNumero,
        responsavelComplemento: dto.responsavelComplemento,
        responsavelBairro: dto.responsavelBairro,
        responsavelCidade: dto.responsavelCidade,
        responsavelEstado: dto.responsavelEstado,
      };

      const aluno = manager.create(Aluno, alunoData);
      const alunoSalvo = await manager.save(Aluno, aluno);

      const documentacao = manager.create(Documentacao, {
        aluno: alunoSalvo,
      });

      const documentacaoSalva = await manager.save(
        Documentacao,
        documentacao,
      );

      alunoSalvo.documentacao = documentacaoSalva;

      return alunoSalvo;
    });
  }

  async findAll(): Promise<Aluno[]> {
    return this.alunoRepository.find({
      relations: ['usuario', 'documentacao', 'turmas'],
    });
  }

  async findOne(id: string): Promise<Aluno> {
    const aluno = await this.alunoRepository.findOne({
      where: { id },
      relations: ['usuario', 'documentacao', 'turmas'],
    });

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return aluno;
  }

  async update(id: string, dto: UpdateAlunoDto): Promise<Aluno> {
    const aluno = await this.findOne(id);
    const usuario = aluno.usuario;

    if (dto.nome) usuario.nome = dto.nome;
    if (dto.email) usuario.email = dto.email;

    if (dto.serieAno) aluno.serieAno = dto.serieAno;
    if (dto.escolaOrigem) aluno.escolaOrigem = dto.escolaOrigem;

    await this.usuarioRepository.save(usuario);
    return this.alunoRepository.save(aluno);
  }

  async remove(id: string): Promise<void> {
    const aluno = await this.findOne(id);
    await this.alunoRepository.remove(aluno);
    await this.usuarioRepository.delete(id);
  }

  private async generateMatricula(): Promise<string> {
    const now = new Date();
    const ano = now.getFullYear().toString();
    const mes = (now.getMonth() + 1).toString().padStart(2, '0');

    const ultima = await this.alunoRepository
      .createQueryBuilder('aluno')
      .where('aluno.matricula_aluno LIKE :prefix', {
        prefix: `${ano}${mes}%`,
      })
      .orderBy('aluno.matricula_aluno', 'DESC')
      .getOne();

    const seq = ultima
      ? parseInt(ultima.matriculaAluno.slice(6), 10) + 1
      : 1;

    return `${ano}${mes}${seq.toString().padStart(3, '0')}`;
  }
}
