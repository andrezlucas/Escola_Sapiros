import { PartialType } from '@nestjs/mapped-types';
import { CreateSecretariaDto } from './create-secretaria.dto';

export class UpdateSecretariaDto extends PartialType(CreateSecretariaDto) {}
