import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'default_secret',
    });
  }

  async validate(payload: any) {
    if (!payload?.sub || typeof payload.tokenVersion !== 'number') {
      throw new UnauthorizedException('Token inválido');
    }

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Tipo de token inválido');
    }

    const usuario = await this.usuarioRepository.findOne({
      where: { id: payload.sub },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    if (payload.tokenVersion !== usuario.tokenVersion) {
      throw new UnauthorizedException('Token expirado');
    }

    return {
      id: usuario.id,
      role: usuario.role,
      turmaId: payload.turmaId ?? null,
    };
  }
}


