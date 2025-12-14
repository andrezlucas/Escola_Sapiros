// src/usuario/dto/update-usuario-block.dto.ts
import { IsBoolean } from 'class-validator';

export class UpdateUsuarioBlockDto {
  @IsBoolean()
  isBlocked: boolean;
}
