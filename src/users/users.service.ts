/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    if (
    (data.role === 'ADMIN' || data.role === 'PARENT') && 
    data.class?.length
  ) {
    throw new BadRequestException('ADMIN/PARENT cannot have classes');
  }

  if (data.role === 'STUDENT' && data.class?.length !== 1) {
    throw new BadRequestException('Student must have exactly one class');
  }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: { ...data, password: hashedPassword },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id: id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id: id } });
  }
}
