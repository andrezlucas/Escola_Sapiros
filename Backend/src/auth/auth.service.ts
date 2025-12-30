import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Aluno } from '../aluno/entities/aluno.entity';
import { Role, Usuario } from '../usuario/entities/usuario.entity';
import { MailService } from '../mail/mail.service';
import { ResetPasswordToken } from './entities/reset-password-token.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectRepository(Aluno)
    private readonly alunoRepository: Repository<Aluno>,
    @InjectRepository(ResetPasswordToken)
    private readonly tokenRepository: Repository<ResetPasswordToken>,
  ) {}

async login(dto: any) {
  const identificador: string = dto.identificador;

  if (!identificador) {
    throw new UnauthorizedException('Identificador é obrigatório');
  }

  let usuario: Usuario | null = null;
  let turmaId: string | null = null;

  const aluno = await this.alunoRepository.findOne({
    where: { matriculaAluno: identificador },
    relations: ['usuario', 'turma'],
  });

  if (aluno) {
    usuario = aluno.usuario;
    turmaId = aluno.turma?.id || null;
  } else {
    usuario = await this.usuarioService.findByCpfOrEmail(identificador);
    if (usuario) {
      const alunoRelacionado = await this.alunoRepository.findOne({
        where: { usuario: { id: usuario.id } },
        relations: ['turma'],
      });
      turmaId = alunoRelacionado?.turma?.id || null;
    }
  }

  if (!usuario) {
    throw new UnauthorizedException('Usuário não encontrado');
  }

  const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);
  if (!senhaValida) {
    throw new UnauthorizedException('Senha incorreta');
  }
  
  if (usuario.isBlocked) {
    throw new UnauthorizedException(
      'Conta temporariamente bloqueada. Complete o cadastro de documentos para liberar o acesso.',
    );
  }

  const senhaPadrao = 'Sapiros@123';
  const isSenhaPadrao = await bcrypt.compare(senhaPadrao, usuario.senha);

  if (isSenhaPadrao) {
    try {
      await this.requestPasswordReset(usuario.email);
    } catch (err) {
      console.error('Erro ao enviar email de redefinição:', err.message);
    }

    throw new UnauthorizedException(
      'Senha temporária detectada. Enviamos um email para redefinição.'
    );
  }

  if (usuario.senhaExpiraEm && new Date() > new Date(usuario.senhaExpiraEm)) {
    throw new UnauthorizedException('A senha expirou. Redefina sua senha.');
  }

  const payload = {
    sub: usuario.id,
    role: usuario.role,
    turmaId: turmaId,
    senhaExpiraEm: usuario.senhaExpiraEm,
  };

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.role,
      turmaId: turmaId,
    },
    token: this.jwtService.sign(payload),
  };
}


  async requestPasswordReset(email: string) {
    const usuario = await this.usuarioService.findByCpfOrEmail(email);
    if (!usuario) throw new BadRequestException('Email não encontrado');

    const token = randomBytes(32).toString('hex');
    const expiraEm = new Date();
    expiraEm.setHours(expiraEm.getHours() + 1);

    const resetToken = this.tokenRepository.create({ token, usuario, expiraEm });
    await this.tokenRepository.save(resetToken);

    const link = `${process.env.FRONTEND_URL}/nova-senha?token=${token}`;
    const html = `
      <h2>Redefinição de Senha</h2>
      <p>Você solicitou redefinir sua senha. Clique no link abaixo para criar uma nova senha:</p>
      <a href="${link}" style="display:inline-block;padding:10px 20px;background-color:#4CAF50;color:white;text-decoration:none;border-radius:5px;">Redefinir Senha</a>
      <p>Se você não solicitou, ignore este email.</p>
    `;
    await this.mailService.sendMail(usuario.email, 'Redefinição de senha', html);

    return { message: 'Email de redefinição enviado' };
  }

  async resetPassword(token: string, senha: string) {
    const resetToken = await this.tokenRepository.findOne({
      where: { token },
      relations: ['usuario'],
    });

    if (!resetToken) throw new BadRequestException('Token inválido');
    if (new Date() > resetToken.expiraEm) throw new BadRequestException('Token expirado');

    const dataExpiracao = new Date();
    dataExpiracao.setDate(dataExpiracao.getDate() + 180);

    await this.usuarioService.update(resetToken.usuario.id, {
      senha: senha,
      senhaExpiraEm: dataExpiracao,
    });

    await this.tokenRepository.remove(resetToken);
    return { message: 'Senha alterada com sucesso' };
  }
}