/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto, UpdateSchoolDto } from './dto/school.dto';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSchoolDto) {
    return this.prisma.school.create({ data: dto });
  }

  async findAll() {
    return this.prisma.school.findMany();
  }

  async findOne(id: string) {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async update(id: string, dto: UpdateSchoolDto) {
    return this.prisma.school.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.school.delete({ where: { id } });
  }
}