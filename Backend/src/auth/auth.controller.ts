import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestResetPasswordDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
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
}
