import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLevelDto, CreateGradeDto, CreateSubgradeDto, CreateClassDto } from './dto/academics.dto';

@Injectable()
export class AcademicService {
  constructor(private prisma: PrismaService) {}

  // LEVEL
  async createLevel(dto: CreateLevelDto) {
    return this.prisma.level.create({ data: dto });
  }
  async getLevels() {
    return this.prisma.level.findMany({ include: { grades: true } });
  }

  // GRADE
  async createGrade(dto: CreateGradeDto) {
    return this.prisma.grade.create({ data: dto });
  }
  async getGrades() {
    return this.prisma.grade.findMany({ include: { subgrades: true, classes: true } });
  }

  // SUBGRADE
  async createSubgrade(dto: CreateSubgradeDto) {
    return this.prisma.subgrade.create({ data: dto });
  }
  async getSubgrades() {
    return this.prisma.subgrade.findMany({ include: { classes: true } });
  }

  // CLASS
  async createClass(dto: CreateClassDto) {
    const grade = await this.prisma.grade.findUnique({ where: { id: dto.gradeId } });
    if (!grade) throw new Error('Grade not found');

    let name = grade.name;

    if (dto.subgradeId) {
      const subgrade = await this.prisma.subgrade.findUnique({ where: { id: dto.subgradeId } });
      if (!subgrade) throw new Error('Subgrade not found');
      name += subgrade.name; // e.g., S1 + A => S1A
    }

    return this.prisma.class.create({
      data: {
        gradeId: dto.gradeId,
        subgradeId: dto.subgradeId,
        name,
      },
    });
  }

  async getClasses() {
    return this.prisma.class.findMany({
      include: { grade: true, subgrade: true },
    });
  }
}
