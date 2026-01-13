import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
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
import { createHash } from 'crypto';
import { gerarCodigoReserva } from 'src/shared/security/codigo-reserva.util';

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
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

async login(dto: any) {
  const { identificador, senha, codigo2fa, codigoReserva } = dto;

  if (!identificador || !senha) {
    throw new UnauthorizedException('Credenciais inválidas');
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
  }

  if (!usuario) {
    throw new UnauthorizedException('Usuário não encontrado');
  }

  if (usuario.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
    throw new UnauthorizedException('Conta temporariamente bloqueada');
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);

  if (!senhaValida) {
    usuario.tentativasLoginFalhas += 1;

    if (usuario.tentativasLoginFalhas >= 5) {
      usuario.bloqueadoAte = new Date(Date.now() + 15 * 60 * 1000);
      usuario.tentativasLoginFalhas = 0;
    }

    await this.usuarioRepository.save(usuario);
    throw new UnauthorizedException('Senha incorreta');
  }

  usuario.tentativasLoginFalhas = 0;
  usuario.bloqueadoAte = undefined;

  if (usuario.isBlocked) {
    throw new UnauthorizedException('Conta bloqueada');
  }

  if (usuario.senhaExpiraEm && new Date() > usuario.senhaExpiraEm) {
    throw new UnauthorizedException('Senha expirada');
  }

  if (usuario.twoFactorEnabled) {
    if (!codigo2fa && !codigoReserva) {
      return {
        requires2FA: true,
        message: 'Informe o código do autenticador ou reserva',
      };
    }

    if (codigoReserva) {
      await this.validarCodigoReserva(usuario, codigoReserva);
    } else {
      await this.validarTotp(usuario, codigo2fa);
    }
  }

  const basePayload = {
    sub: usuario.id,
    role: usuario.role,
    tokenVersion: usuario.tokenVersion,
    turmaId,
  };

  const accessToken = this.jwtService.sign(
    { ...basePayload, type: 'access' },
    { expiresIn: '15m' },
  );

  const refreshToken = this.jwtService.sign(
    { ...basePayload, type: 'refresh' },
    { expiresIn: '30d' },
  );

  usuario.refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  usuario.refreshTokenExpiraEm = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  usuario.ultimoLoginEm = new Date();

  await this.usuarioRepository.save(usuario);

  return {
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      role: usuario.role,
      turmaId,
    },
    accessToken,
    refreshToken,
  };
}

async logout(usuarioId: string) {
  const usuario = await this.usuarioRepository.findOne({
    where: { id: usuarioId },
  });

  if (!usuario) {
    return;
  }

  usuario.tokenVersion += 1;
  usuario.refreshTokenHash = undefined;
  usuario.refreshTokenExpiraEm = undefined;

  await this.usuarioRepository.save(usuario);
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


private hashCodigo(codigo: string): string {
  return createHash('sha256').update(codigo).digest('hex');
}

async validarCodigoReserva(usuario: Usuario, codigoInformado: string) {
  if (!usuario.codigosReserva?.length) {
    throw new UnauthorizedException('Nenhum código disponível');
  }

  for (const item of usuario.codigosReserva) {
    if (item.usado) continue;

    const valido = await bcrypt.compare(codigoInformado, item.codigo);

    if (valido) {
      item.usado = true;
      item.usadoEm = new Date();

      await this.usuarioRepository.save(usuario);
      return true;
    }
  }

  throw new UnauthorizedException('Código de reserva inválido');
}


async validarTotp(usuario: Usuario, codigo: string) {
  const speakeasy = require('speakeasy');

  const valido = speakeasy.totp.verify({
    secret: usuario.twoFactorSecret,
    encoding: 'base32',
    token: codigo,
    window: 1,
  });

  if (!valido) {
    throw new UnauthorizedException('Código 2FA inválido');
  }
}
async refresh(refreshToken: string) {
  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token não fornecido');
  }

  let payload: any;

  try {
    payload = this.jwtService.verify(refreshToken);
  } catch {
    throw new UnauthorizedException('Refresh token inválido ou expirado');
  }

  if (payload.type !== 'refresh') {
    throw new UnauthorizedException();
  }

  const usuario = await this.usuarioRepository.findOne({
    where: { id: payload.sub },
  });

  if (
    !usuario ||
    !usuario.refreshTokenHash ||
    !usuario.refreshTokenExpiraEm ||
    usuario.refreshTokenExpiraEm < new Date()
  ) {
    throw new UnauthorizedException();
  }

  const valido = await bcrypt.compare(
    refreshToken,
    usuario.refreshTokenHash,
  );

  if (!valido || usuario.tokenVersion !== payload.tokenVersion) {
    throw new UnauthorizedException();
  }

  const accessToken = this.jwtService.sign(
    {
      sub: usuario.id,
      role: usuario.role,
      tokenVersion: usuario.tokenVersion,
      type: 'access',
    },
    { expiresIn: '15m' },
  );

  return { accessToken };
}



async gerar2FA(usuarioId: string) {
  const speakeasy = require('speakeasy');
  const qrcode = require('qrcode');

  const secret = speakeasy.generateSecret({
    name: `Sapiros (${usuarioId})`,
  });

  const qrCode = await qrcode.toDataURL(secret.otpauth_url);

  return {
    qrCode,
    base32: secret.base32, // frontend NÃO salva
  };
}

async ativar2FA(usuarioId: string, codigo: string, secret: string) {
  const speakeasy = require('speakeasy');

  const valido = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token: codigo,
    window: 1,
  });

  if (!valido) {
    throw new UnauthorizedException('Código inválido');
  }

  const usuario = await this.usuarioRepository.findOne({
    where: { id: usuarioId },
  });

  if (!usuario) {
    throw new NotFoundException('Usuário não encontrado');
  }

  // 🔐 ativa 2FA
  usuario.twoFactorSecret = secret;
  usuario.twoFactorEnabled = true;

  // 🔑 gera códigos reserva
  const codigos = Array.from({ length: 10 }).map(() =>
    gerarCodigoReserva(),
  );

 usuario.codigosReserva = await Promise.all(
  codigos.map(async codigo => ({
    codigo: await bcrypt.hash(codigo, 10),
    usado: false,
  })),
);


  // 🔐 invalida sessões existentes
  usuario.tokenVersion += 1;

  await this.usuarioRepository.save(usuario);

  return {
    message: '2FA ativado com sucesso',
    codigosReserva: codigos, // ⚠️ mostrar só UMA vez no frontend
  };
}
async desativar2FA(usuarioId: string, senha: string) {
  const usuario = await this.usuarioRepository.findOne({
    where: { id: usuarioId },
  });

  if (!usuario) {
    throw new NotFoundException('Usuário não encontrado');
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) {
    throw new UnauthorizedException('Senha inválida');
  }

  usuario.twoFactorEnabled = false;
  usuario.twoFactorSecret = undefined;
  usuario.codigosReserva = [];

  // 🔐 invalida tokens
  usuario.tokenVersion += 1;

  await this.usuarioRepository.save(usuario);

  return {
    message:
      '2FA desativado com sucesso. Todos os dispositivos foram desconectados.',
  };
}


}