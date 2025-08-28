import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectCardDto, SubjectDetailDto, CreateSubjectDto, UpdateSubjectDto} from './dto/subject.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // Build a public URL for a stored file
  private buildPublicUrl(filename: string) {
    const base = process.env.UPLOADS_PUBLIC_URL ?? '/uploads';
    return `${base}/${filename}`;
  }

  async listSubjects(opts?: { class?: string; userId?: string }): Promise<SubjectCardDto[]> {
    const klass = opts?.class;

    // validate and normalize class filter
    

    const subjects = await this.prisma.subject.findMany({
      include: {
        teacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: { name: 'asc' },
    });

    const results: SubjectCardDto[] = [];
    for (const s of subjects) {
      // Fixed: Use proper relation filter instead of string comparison
      const lessonsTotal = await this.prisma.courseMaterial.count({ 
        where: { subjectId: s.id } 
      });
      const lessonsCompleted = 0; // TODO: compute per user when you have tracking
      const progressPct = lessonsTotal ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0;

      results.push({
        id: s.id,
        name: s.name,
        code: s.code,
        gradeId: s.gradeId, 
        description: s.description,
        durationWeeks: s.durationWeeks,
        teacherName: s.teacher ? `${s.teacher.firstName} ${s.teacher.lastName}` : null,
        lessonsTotal,
        lessonsCompleted,
        progressPct,
      });
    }

    return results;
  }

  async getSubjectDetail(subjectId: string, _opts?: { userId?: string }): Promise<SubjectDetailDto> {
    const s = await this.prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        topics: true,
        teacher: { select: { firstName: true, lastName: true } },
      },
    });
    if (!s) throw new NotFoundException('Subject not found');

    // Fixed: Use proper relation filter and include uploadedBy relation
    const files = await this.prisma.courseMaterial.findMany({
      where: { subjectId: s.id },
      include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const lessonsTotal = files.length;
    const lessonsCompleted = 0; // TODO
    const progressPct = lessonsTotal ? Math.round((lessonsCompleted / lessonsTotal) * 100) : 0;

    return {
      id: s.id,
      name: s.name,
      code: s.code,
      gradeId: s.gradeId ,
      description: s.description,
      durationWeeks: s.durationWeeks,
      teacherName: s.teacher ? `${s.teacher.firstName} ${s.teacher.lastName}` : null,
      lessonsTotal,
      lessonsCompleted,
      progressPct,
      topics: s.topics.map(t => ({ id: t.id, name: t.name })),
      files: files.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        fileUrl: f.fileUrl,
        // Fixed: Use uploadedBy instead of uploadedBy property access
        uploadedBy: f.uploadedBy
          ? { id: f.uploadedBy.id, firstName: f.uploadedBy.firstName, lastName: f.uploadedBy.lastName }
          : null,
        createdAt: f.createdAt,
      })),
    };
  }

async createSubject(dto: CreateSubjectDto) {
  if (dto.userId) {
    const count = await this.prisma.user.count({ where: { id: dto.userId } });
    if (!count) throw new BadRequestException('userId does not exist');
  }

  return this.prisma.subject.create({
    data: {
      name: dto.name,
      code: dto.code,
      gradeId: dto.gradeId,
      description: dto.description ?? null,
      durationWeeks: dto.durationWeeks ?? null,
      userId: dto.userId ?? null, 
    },
    include: { teacher: { select: { firstName: true, lastName: true } } },
  });
}

  async updateSubject(id: string, dto: UpdateSubjectDto) {
    const existingSubject = await this.prisma.subject.findUnique({ where: { id } });
    if (!existingSubject) throw new NotFoundException('Subject not found');

    const teacherRelation =
      dto.userId !== undefined
        ? dto.userId
          ? { teacher: { connect: { id: dto.userId } } }
          : { teacher: { disconnect: true } }
        : {};

    return this.prisma.subject.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.class !== undefined && { class: dto.class }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.durationWeeks !== undefined && { durationWeeks: dto.durationWeeks }),
        ...teacherRelation,
      },
      include: { teacher: { select: { firstName: true, lastName: true } } },
    });
  }

  async deleteSubject(id: string) {
    const existingSubject = await this.prisma.subject.findUnique({ where: { id } });
    if (!existingSubject) throw new NotFoundException('Subject not found');

    await this.prisma.subject.delete({ where: { id } });
    return { ok: true };
  }

  // -------- Topics --------
  async listTopics(subjectId: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('Subject not found');

    return this.prisma.topic.findMany({ where: { subjectId }, orderBy: { name: 'asc' } });
  }

  async addTopic(subjectId: string, name: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('Subject not found');

    return this.prisma.topic.create({ data: { subjectId, name } });
  }

  async removeTopic(topicId: string) {
    const existingTopic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!existingTopic) throw new NotFoundException('Topic not found');

    await this.prisma.topic.delete({ where: { id: topicId } });
    return { ok: true };
  }

  // -------- Files --------

  // Files for a subject (by subject ID)
  async listFilesForSubject(subjectId: string) {
    const s = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!s) throw new NotFoundException('Subject not found');

    // Fixed: Use subjectId instead of subject name
    return this.prisma.courseMaterial.findMany({
      where: { subjectId: s.id },
      include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Upload a file to a subject (multipart)
  async uploadFileToSubject(
    subjectId: string,
    file: Express.Multer.File,
    meta: { title: string; description?: string; uploaderId?: string },
  ) {
    const subject = await this.prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) throw new NotFoundException('Subject not found');
    if (!file) throw new BadRequestException('File is required');

    const fileUrl = this.buildPublicUrl(file.filename);

    // Build the data object conditionally
const createData: any = {
  title: meta.title,
  description: meta.description ?? null,
  fileUrl,
  subjectId, // direct FK
};

// Only add uploader if provided
if (meta.uploaderId) {
  createData.uploadedById = meta.uploaderId; // <-- use scalar FK (not uploadedBy.connect)
}

return this.prisma.courseMaterial.create({
  data: createData,
  include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
});
  }


  async uploadFileToTopic(
    topicId: string,
    file: Express.Multer.File,
    meta: { title: string; description?: string; uploaderId?: string },
  ) {
    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
      include: { subject: { select: { id: true, name: true } } },
    });
    if (!topic) throw new NotFoundException('Topic not found');
    if (!file) throw new BadRequestException('File is required');

    const fileUrl = this.buildPublicUrl(file.filename);


    const createData: any = {
  title: meta.title,
  description: meta.description ?? null,
  fileUrl,
  subjectId: topic.subject.id, 
  topicId,                     
};

if (meta.uploaderId) {
  createData.uploadedById = meta.uploaderId; 
}

return this.prisma.courseMaterial.create({
  data: createData,
  include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
});
  }

  // List files for a topic
  async listFilesForTopic(topicId: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id: topicId } });
    if (!topic) throw new NotFoundException('Topic not found');

    return this.prisma.courseMaterial.findMany({
      where: { topicId },
      include: { uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Delete a file; best-effort removal of local artifact
  async deleteFile(fileId: string) {
    const material = await this.prisma.courseMaterial.findUnique({ where: { id: fileId } });
    if (!material) throw new NotFoundException('File not found');

    try {
      if (material.fileUrl?.startsWith('/uploads/')) {
        const abs = path.resolve(process.cwd(), '.' + material.fileUrl);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      }
    } catch { /* ignore */ }

    await this.prisma.courseMaterial.delete({ where: { id: fileId } });
    return { ok: true };
  }
}