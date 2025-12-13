import { Controller, Get, Param, Post,Body,UseGuards, Patch,Delete,ParseUUIDPipe, BadRequestException,} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario, Role } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtAuthGuard } from '../auth/strategy/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { RolesGuard } from '../auth/roles/roles.guard';
import { SenhaExpiradaGuard } from 'src/auth/senha-expirada/senha-expirada.guard';


type UsuarioResponse = Omit<Usuario, 'senha' | 'senhaExpiraEm' | 'senhaAtualizadaEm' | 'UsuariocriadoEm' | 'UsuarioatualizadoEm'> & {
    senhaExpiraEm: string;
    senhaAtualizadaEm: string;
    UsuariocriadoEm: string;
    UsuarioatualizadoEm: string;
};


function formatarDataISO(data?: Date | string | null): string | null {
    if (!data) return null;
    const d = typeof data === 'string' ? new Date(data) : data;
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
}


function formatarUsuario(u: Partial<Usuario>): UsuarioResponse {
    const { 
        senha, 
        senhaExpiraEm, 
        senhaAtualizadaEm, 
        criadoEm, 
        atualizadoEm, 
        ...resto 
    } = u;

    return {
        ...resto,
        senhaExpiraEm: formatarDataISO(senhaExpiraEm) as string,
        senhaAtualizadaEm: formatarDataISO(senhaAtualizadaEm) as string,
        UsuariocriadoEm: formatarDataISO(criadoEm) as string,
        UsuarioatualizadoEm: formatarDataISO(atualizadoEm) as string,
    } as UsuarioResponse;
}

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard, SenhaExpiradaGuard)
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) {}

    @Roles(Role.COORDENACAO, Role.PROFESSOR)
    @Get()
    async findAll(): Promise<UsuarioResponse[]> {
        const usuarios = await this.usuarioService.findAll();
        return usuarios.map(u => formatarUsuario(u));
    }

    @Roles(Role.COORDENACAO, Role.PROFESSOR)
    @Get('role/:role')
    async findByRole(@Param('role') roleParam: string): Promise<UsuarioResponse[]> {
        const roleLower = roleParam.toLowerCase();
        const validRoles = Object.values(Role);
        if (!validRoles.includes(roleLower as Role)) {
            throw new BadRequestException(`Role inválida. Valores válidos: ${validRoles.join(', ')}`);
        }
        const usuarios = await this.usuarioService.findByRole(roleLower as Role);
        return usuarios.map(u => formatarUsuario(u));
    }

    @Roles(Role.COORDENACAO, Role.PROFESSOR)
    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UsuarioResponse> {
        const usuario = await this.usuarioService.findOne(id);
        return formatarUsuario(usuario);
    }

    @Roles(Role.COORDENACAO)
    @Post()
    async create(@Body() dto: CreateUsuarioDto): Promise<UsuarioResponse> {
        const usuario = await this.usuarioService.create(dto);
        return formatarUsuario(usuario);
    }

    @Roles(Role.COORDENACAO)
    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateUsuarioDto,
    ): Promise<UsuarioResponse> {
        const usuario = await this.usuarioService.update(id, dto);
        return formatarUsuario(usuario);
    }

    @Roles(Role.COORDENACAO)
    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
        await this.usuarioService.remove(id);
        return { message: 'Usuário removido com sucesso' };
    }
}