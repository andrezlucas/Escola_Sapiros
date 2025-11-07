import { Injectable } from '@nestjs/common';
import { CreateResponsavelDto } from './dto/create-responsavel.dto';
import { UpdateResponsavelDto } from './dto/update-responsavel.dto';

@Injectable()
export class ResponsavelService {
  create(createResponsavelDto: CreateResponsavelDto) {
    return 'This action adds a new responsavel';
  }

  findAll() {
    return `This action returns all responsavel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} responsavel`;
  }

  update(id: number, updateResponsavelDto: UpdateResponsavelDto) {
    return `This action updates a #${id} responsavel`;
  }

  remove(id: number) {
    return `This action removes a #${id} responsavel`;
  }
}
