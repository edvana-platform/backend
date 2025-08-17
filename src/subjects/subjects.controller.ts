import { 
  Body, Controller, Get, Param, Post, Patch, Delete, Query,
  HttpStatus, HttpCode, ValidationPipe, UsePipes, UseGuards,
  UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiConsumes, ApiBearerAuth
} from '@nestjs/swagger';
import { SubjectsService } from './subjects.service';
import { 
  CreateSubjectDto, UpdateSubjectDto, CreateTopicDto, SubjectCardDto, SubjectDetailDto, UploadFileMetaDto
} from './dto/subject.dto';
import { RolesGuard } from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@ApiTags('Subjects')
@Controller('subjects')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class SubjectsController {
  constructor(private readonly svc: SubjectsService) {}

  // Cards list (optionally filter by class="S6")
  @Get()
  @ApiOperation({ summary: 'Get all subjects' })
  @ApiQuery({ name: 'class', required: false, description: 'Filter by class level' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiResponse({ status: 200, description: 'List of subjects', type: [SubjectCardDto] })
  async list(@Query('class') klass?: string, @Query('userId') userId?: string) {
    return this.svc.listSubjects({ class: klass, userId });
  }

  // Detail: topics + files + card fields
  @Get(':id')
  @ApiOperation({ summary: 'Get subject details' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID for personalized data' })
  @ApiResponse({ status: 200, description: 'Subject details', type: SubjectDetailDto })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async detail(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.svc.getSubjectDetail(id, { userId });
  }

  // Manage subjects
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiBody({ type: CreateSubjectDto })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() dto: CreateSubjectDto) {
    return this.svc.createSubject(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiBody({ type: UpdateSubjectDto })
  @ApiResponse({ status: 200, description: 'Subject updated successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async update(@Param('id') id: string, @Body() dto: UpdateSubjectDto) {
    return this.svc.updateSubject(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 204, description: 'Subject deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async remove(@Param('id') id: string) {
    return this.svc.deleteSubject(id);
  }

  // Topics
  @Get(':id/topics')
  @ApiOperation({ summary: 'Get topics for a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'List of topics' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async listTopics(@Param('id') id: string) {
    return this.svc.listTopics(id);
  }

  @Post(':id/topics')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a topic to a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiBody({ type: CreateTopicDto })
  @ApiResponse({ status: 201, description: 'Topic added successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async addTopic(@Param('id') id: string, @Body() body: CreateTopicDto) {
    return this.svc.addTopic(id, body.name);
  }

  @Delete('topics/:topicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a topic' })
  @ApiParam({ name: 'topicId', description: 'Topic ID' })
  @ApiResponse({ status: 204, description: 'Topic removed successfully' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async removeTopic(@Param('topicId') topicId: string) {
    return this.svc.removeTopic(topicId);
  }

  // Files (subject-level listing already exists)
  @Get(':id/files')
  @ApiOperation({ summary: 'Get files for a subject' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiResponse({ status: 200, description: 'List of course materials' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async files(@Param('id') id: string) {
    return this.svc.listFilesForSubject(id);
  }

  // ---------- Upload to SUBJECT (multipart) ----------
  private static storage = diskStorage({
    destination: './uploads',
    filename: (_req, file, cb) => cb(null, `${uuid()}${extname(file.originalname)}`),
  });

  private static allowedTypes = new Set<string>([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/webp',
    'video/mp4',
    'text/plain',
  ]);

  private static fileFilter(_req: any, file: Express.Multer.File, cb: (error: any, acceptFile: boolean) => void) {
    if (!SubjectsController.allowedTypes.has(file.mimetype)) {
      return cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
    }
    cb(null, true);
  }

  @Post(':id/files')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a file to a subject (multipart/form-data)' })
  @ApiParam({ name: 'id', description: 'Subject ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File + metadata',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        uploaderId: { type: 'string' },
      },
      required: ['file', 'title'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: SubjectsController.storage,
      fileFilter: SubjectsController.fileFilter,
      limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    }),
  )
  async uploadSubjectFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() meta: UploadFileMetaDto,
  ) {
    return this.svc.uploadFileToSubject(id, file, meta);
  }

  // ---------- Upload to TOPIC (multipart) ----------
  @Post('topics/:topicId/files')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a file to a topic (multipart/form-data)' })
  @ApiParam({ name: 'topicId', description: 'Topic ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File + metadata',
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        title: { type: 'string' },
        description: { type: 'string' },
        uploaderId: { type: 'string' },
      },
      required: ['file', 'title'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: SubjectsController.storage,
      fileFilter: SubjectsController.fileFilter,
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  async uploadTopicFile(
    @Param('topicId') topicId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() meta: UploadFileMetaDto,
  ) {
    return this.svc.uploadFileToTopic(topicId, file, meta);
  }

  // ---------- List files for a topic ----------
  @Get('topics/:topicId/files')
  @ApiOperation({ summary: 'Get files for a topic' })
  @ApiParam({ name: 'topicId', description: 'Topic ID' })
  @ApiResponse({ status: 200, description: 'List of topic files' })
  async listTopicFiles(@Param('topicId') topicId: string) {
    return this.svc.listFilesForTopic(topicId);
  }

  // ---------- Delete a file ----------
  @Delete('files/:fileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file (CourseMaterial)' })
  @ApiParam({ name: 'fileId', description: 'File (CourseMaterial) ID' })
  @ApiResponse({ status: 204, description: 'File deleted' })
  async deleteFile(@Param('fileId') fileId: string) {
    await this.svc.deleteFile(fileId);
    return;
  }
}
