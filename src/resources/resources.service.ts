import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto, UpdateResourceDto } from './dto/resources.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Utility to convert BigInt fields to string recursively */
  private convertBigInt(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertBigInt(item));
    } else if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'bigint') {
          newObj[key] = value.toString();
        } else {
          newObj[key] = this.convertBigInt(value);
        }
      }
      return newObj;
    }
    return obj;
  }

  async listResources(subjectId?: string, gradeIds?: string[], tags?: string[]) {
    const whereClause: any = {};

    if (subjectId) whereClause.subjectId = subjectId;
    if (gradeIds && gradeIds.length > 0) whereClause.gradeIds = { hasSome: gradeIds };
    if (tags && tags.length > 0) whereClause.tags = { hasSome: tags };

    const resources = await this.prisma.resource.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: { 
        subject: true,
        grades: { select: { id: true, name: true, level: true } },
        file: true
      },
    });

    return this.convertBigInt(resources);
  }

  async getResource(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: { 
        subject: true,
        grades: { select: { id: true, name: true, level: true } },
        file: true
      },
    });

    if (!resource) throw new NotFoundException('Resource not found');
    return this.convertBigInt(resource);
  }

  private async createFileRecord(file: Express.Multer.File): Promise<string> {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const uniqueFileName = `${timestamp}_${randomString}${extension}`;

    await this.prisma.file.create({
      data: {
        name: uniqueFileName,
        size: BigInt(file.size), // Prisma BigInt
        type: file.mimetype,
        extension: extension.replace('.', ''),
      }
    });

    return uniqueFileName;
  }

  private async updateFileRecord(oldFileName: string | null, file: Express.Multer.File): Promise<string> {
    if (oldFileName) {
      await this.prisma.file.delete({ where: { name: oldFileName } }).catch(() => {});
    }
    return this.createFileRecord(file);
  }

  async createResource(dto: CreateResourceDto, file?: Express.Multer.File) {
    if (!dto.fileUrl && !file) throw new BadRequestException('Either file or fileUrl must be provided');

    const subjectExists = await this.prisma.subject.findUnique({ where: { id: dto.subjectId } });
    if (!subjectExists) throw new BadRequestException('Subject not found');

    // Validate grades
    const existingGrades = await this.prisma.grade.findMany({
      where: { id: { in: dto.gradeIds } },
      select: { id: true }
    });
    if (existingGrades.length !== dto.gradeIds.length) {
      const existingGradeIds = existingGrades.map(g => g.id);
      const invalidGradeIds = dto.gradeIds.filter(id => !existingGradeIds.includes(id));
      throw new BadRequestException(`Invalid grade IDs: ${invalidGradeIds.join(', ')}`);
    }

    let fileName: string | null = null;
    let fileUrl: string | null = null;

    if (file) {
      fileName = await this.createFileRecord(file);
      fileUrl = `/uploads/${fileName}`;
    } else if (dto.fileUrl) {
      fileUrl = dto.fileUrl;
    }

    const resource = await this.prisma.resource.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        fileUrl,
        fileName,
        resourceType: dto.resourceType,
        subjectId: dto.subjectId,
        gradeIds: dto.gradeIds,
        tags: dto.tags ?? [],
        status: dto.status ?? 'Active',
        grades: { connect: dto.gradeIds.map(id => ({ id })) }
      },
      include: {
        subject: true,
        grades: { select: { id: true, name: true, level: true } },
        file: true
      }
    });

    return this.convertBigInt(resource);
  }

  async updateResource(id: string, dto: UpdateResourceDto, file?: Express.Multer.File) {
    const existing = await this.prisma.resource.findUnique({ 
      where: { id },
      include: { grades: true, file: true }
    });
    if (!existing) throw new NotFoundException('Resource not found');

    if (dto.subjectId) {
      const subjectExists = await this.prisma.subject.findUnique({ where: { id: dto.subjectId } });
      if (!subjectExists) throw new BadRequestException('Subject not found');
    }

    if (dto.gradeIds) {
      const existingGrades = await this.prisma.grade.findMany({
        where: { id: { in: dto.gradeIds } },
        select: { id: true }
      });
      if (existingGrades.length !== dto.gradeIds.length) {
        const existingGradeIds = existingGrades.map(g => g.id);
        const invalidGradeIds = dto.gradeIds.filter(id => !existingGradeIds.includes(id));
        throw new BadRequestException(`Invalid grade IDs: ${invalidGradeIds.join(', ')}`);
      }
    }

    const updateData: any = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.resourceType !== undefined) updateData.resourceType = dto.resourceType;
    if (dto.subjectId !== undefined) updateData.subjectId = dto.subjectId;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.status !== undefined) updateData.status = dto.status;

    if (file) {
      const newFileName = await this.updateFileRecord(existing.fileName, file);
      updateData.fileName = newFileName;
      updateData.fileUrl = `/uploads/${newFileName}`;
    } else if (dto.fileUrl !== undefined) {
      if (existing.fileName) {
        await this.prisma.file.delete({ where: { name: existing.fileName } }).catch(() => {});
      }
      updateData.fileName = null;
      updateData.fileUrl = dto.fileUrl;
    }

    if (dto.gradeIds !== undefined) {
      updateData.gradeIds = dto.gradeIds;
      updateData.grades = {
        set: [],
        connect: dto.gradeIds.map(id => ({ id }))
      };
    }

    const updated = await this.prisma.resource.update({
      where: { id },
      data: updateData,
      include: {
        subject: true,
        grades: { select: { id: true, name: true, level: true } },
        file: true
      }
    });

    return this.convertBigInt(updated);
  }

  async deleteResource(id: string) {
    const existing = await this.prisma.resource.findUnique({ 
      where: { id },
      include: { file: true }
    });
    if (!existing) throw new NotFoundException('Resource not found');

    if (existing.fileName) {
      await this.prisma.file.delete({ where: { name: existing.fileName } }).catch(() => {});
    }

    await this.prisma.resource.delete({ where: { id } });
    return { ok: true };
  }

  async getResourcesByGrade(gradeId: string) {
    const resources = await this.prisma.resource.findMany({
      where: { gradeIds: { has: gradeId } },
      include: { subject: true, grades: { select: { id: true, name: true, level: true } }, file: true }
    });
    return this.convertBigInt(resources);
  }

  async getResourcesByMultipleGrades(gradeIds: string[]) {
    const resources = await this.prisma.resource.findMany({
      where: { gradeIds: { hasSome: gradeIds } },
      include: { subject: true, grades: { select: { id: true, name: true, level: true } }, file: true }
    });
    return this.convertBigInt(resources);
  }

  async getFileInfo(fileName: string) {
    const file = await this.prisma.file.findUnique({ where: { name: fileName } });
    return this.convertBigInt(file);
  }
}
