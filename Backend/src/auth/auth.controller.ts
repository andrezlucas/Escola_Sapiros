import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestResetPasswordDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

import { JwtAuthGuard } from './strategy/jwt-auth.guard';

type AuthRequest = Request & {
  user: { id: string };
};


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }


  @Post('senha-bloqueada')
  async senhaBloqueada(@Body() body: { email: string }) {
    return this.authService.requestPasswordReset(body.email);
  }

  @Post('esqueceu-senha')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() dto: RequestResetPasswordDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('nova-senha')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(@Body() dto: ResetPasswordDto) {
    if (dto.senha !== dto.confirmarSenha) {
      throw new BadRequestException('As senhas não coincidem');
    }

    return this.authService.resetPassword(dto.token, dto.senha);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/gerar')
  async gerar2FA(@Req() req: AuthRequest) {
    return this.authService.gerar2FA(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/ativar')
  async ativar2FA(
    @Req() req: AuthRequest,
    @Body() body: { codigo: string; secret: string },
  ) {
    return this.authService.ativar2FA(
      req.user.id,
      body.codigo,
      body.secret,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/desativar')
  async desativar2FA(
    @Req() req: AuthRequest,
    @Body() body: { senha: string },
  ) {
    return this.authService.desativar2FA(req.user.id, body.senha);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: AuthRequest) {
    await this.authService.logout(req.user.id);
    return { message: 'Logout realizado com sucesso' };
  }


}
