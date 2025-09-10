import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto } from './dto/resources.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/roles.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// Configure multer for file uploads
const storage = diskStorage({
  destination: './uploads', // Make sure this directory exists
  filename: (req, file, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = extname(file.originalname);
    const uniqueFileName = `${timestamp}_${randomString}${extension}`;
    cb(null, uniqueFileName);
  },
});

@ApiTags('Resources')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiQuery({ name: 'subjectId', required: false, description: 'Filter by subject ID' })
  @ApiQuery({ name: 'gradeIds', required: false, description: 'Filter by grade IDs (comma-separated)', type: String })
  @ApiQuery({ name: 'tags', required: false, description: 'Filter by tags (comma-separated)', type: String })
  async listResources(
    @Query('subjectId') subjectId?: string, 
    @Query('gradeIds') gradeIds?: string,
    @Query('tags') tags?: string
  ) {
    const gradeIdArray = gradeIds ? gradeIds.split(',').map(id => id.trim()) : undefined;
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
    
    return this.resourcesService.listResources(subjectId, gradeIdArray, tagArray);
  }

  @Get(':id')
  async getResource(@Param('id') id: string) {
    return this.resourcesService.getResource(id);
  }

  @Get('download/:fileName')
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      // Get file info from database
      const fileInfo = await this.resourcesService.getFileInfo(fileName);
      if (!fileInfo) {
        return res.status(404).json({ error: 'File not found' });
      }

      const filePath = path.join(process.cwd(), 'uploads', fileName);
      
      // Check if file exists on disk
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', fileInfo.type);
      res.setHeader('Content-Length', fileInfo.size.toString());
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ error: 'Error downloading file' });
    }
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiConsumes('multipart/form-data')
  async createResource(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateResourceDto) {
    return this.resourcesService.createResource(dto, file);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file', { storage }))
  @ApiConsumes('multipart/form-data')
  async updateResource(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Body() dto: UpdateResourceDto) {
    return this.resourcesService.updateResource(id, dto, file);
  }

  @Delete(':id')
  async deleteResource(@Param('id') id: string) {
    return this.resourcesService.deleteResource(id);
  }
}