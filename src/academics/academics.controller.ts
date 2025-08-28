import { Controller, Post, Body, Get } from '@nestjs/common';
import { AcademicService } from './academics.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateLevelDto, CreateGradeDto, CreateSubgradeDto, CreateClassDto } from './dto/academics.dto';

@ApiTags('Academic')
@ApiBearerAuth('access-token')
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // LEVEL
  @Post('level')
  @ApiOperation({ summary: 'Create a Level' })
  @ApiResponse({ status: 201, description: 'Level created successfully' })
  createLevel(@Body() dto: CreateLevelDto) {
    return this.academicService.createLevel(dto);
  }

  @Get('level')
  getLevels() {
    return this.academicService.getLevels();
  }

  // GRADE
  @Post('grade')
  @ApiOperation({ summary: 'Create a Grade' })
  createGrade(@Body() dto: CreateGradeDto) {
    return this.academicService.createGrade(dto);
  }

  @Get('grade')
  getGrades() {
    return this.academicService.getGrades();
  }

  // SUBGRADE
  @Post('subgrade')
  @ApiOperation({ summary: 'Create a Subgrade' })
  createSubgrade(@Body() dto: CreateSubgradeDto) {
    return this.academicService.createSubgrade(dto);
  }

  @Get('subgrade')
  getSubgrades() {
    return this.academicService.getSubgrades();
  }

  // CLASS
  @Post('class')
  @ApiOperation({ summary: 'Create a Class' })
  createClass(@Body() dto: CreateClassDto) {
    return this.academicService.createClass(dto);
  }

  @Get('class')
  getClasses() {
    return this.academicService.getClasses();
  }
}
