import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Professor } from './entities/professor.entity';
import { Formacao } from './entities/formacao.entity';
import { Usuario, Role } from '../usuario/entities/usuario.entity';
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { Turma } from '../turma/entities/turma.entity';
import { Disciplina } from '../disciplina/entities/disciplina.entity';

@Injectable()
export class ProfessorService {
  constructor(
    @InjectRepository(Professor)
    private readonly professorRepository: Repository<Professor>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Turma)
    private turmaRepository: Repository<Turma>,
    @InjectRepository(Disciplina)
    private disciplinaRepository: Repository<Disciplina>,
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
      formacoes,
    } = createDto;

    const exists = await this.usuarioRepository.findOne({
      where: email ? [{ cpf }, { email }] : [{ cpf }],
    });

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
      });

      professor.formacoes = formacoes.map((f) =>
        manager.create(Formacao, {
          curso: f.curso,
          instituicao: f.instituicao,
          dataInicio: new Date(f.dataInicio),
          dataConclusao: f.dataConclusao ? new Date(f.dataConclusao) : undefined,
        }),
      );

      return await manager.save(professor);
    });
  }

  async findAll(): Promise<Professor[]> {
    return this.professorRepository.find({
      relations: ['usuario', 'turmas', 'disciplinas', 'formacoes'],
    });
  }

  async findOne(id: string): Promise<Professor> {
    const professor = await this.professorRepository.findOne({
      where: { id },
      relations: ['usuario', 'turmas', 'disciplinas', 'formacoes'],
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
        relations: ['usuario', 'formacoes'],
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
        enderecoLogradouro: updateDto.enderecoLogradouro ?? usuario.enderecoLogradouro,
        enderecoNumero: updateDto.enderecoNumero ?? usuario.enderecoNumero,
        enderecoCep: updateDto.enderecoCep ?? usuario.enderecoCep,
        enderecoComplemento: updateDto.enderecoComplemento ?? usuario.enderecoComplemento,
        enderecoBairro: updateDto.enderecoBairro ?? usuario.enderecoBairro,
        enderecoEstado: updateDto.enderecoEstado ?? usuario.enderecoEstado,
        enderecoCidade: updateDto.enderecoCidade ?? usuario.enderecoCidade,
      });

      if (updateDto.data_nascimento) {
        usuario.dataNascimento = new Date(updateDto.data_nascimento);
      }

      if (updateDto.formacoes) {
        await manager.delete(Formacao, { professor: { id } });
        professor.formacoes = updateDto.formacoes.map((f) =>
          manager.create(Formacao, {
            curso: f.curso,
            instituicao: f.instituicao,
            dataInicio: new Date(f.dataInicio),
            dataConclusao: f.dataConclusao ? new Date(f.dataConclusao) : undefined,
          }),
        );
      }

      await manager.save(usuario);
      return await manager.save(professor);
    });
  }

  async remove(id: string): Promise<void> {
    const professor = await this.findOne(id);
    await this.professorRepository.remove(professor);
  }

async findTurmas(professorId: string) {
  return this.turmaRepository
    .createQueryBuilder('turma')
    .innerJoin('turma.professor', 'professor', 'professor.id = :id', {
      id: professorId,
    })
    .leftJoin('turma.disciplinas', 'disciplina')
    .select([
      'turma.id',
      'turma.nome_turma',
      'turma.turno',
    ])
    .addSelect(['disciplina.id_disciplina', 'disciplina.nome_disciplina'])
    .orderBy('turma.nome_turma', 'ASC')
    .getMany();
}

  async findDisciplinas(professorId: string) {
    return this.disciplinaRepository
      .createQueryBuilder('disciplina')
      .innerJoin(
        'disciplina.professores',
        'professor',
        'professor.id = :id',
        { id: professorId },
      )
      .select(['disciplina.id_disciplina', 'disciplina.nome_disciplina'])
      .orderBy('disciplina.nome_disciplina', 'ASC')
      .getMany();
  }
}