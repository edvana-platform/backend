/* eslint-disable */
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SchoolsService } from './schools.service';
import { CreateSchoolDto, UpdateSchoolDto } from './dto/school.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Schools')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new school' })
  @ApiCreatedResponse({ description: 'School created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() dto: CreateSchoolDto) {
    return this.schoolsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all schools' })
  @ApiOkResponse({ description: 'List of schools retrieved successfully' })
  findAll() {
    return this.schoolsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get school by ID' })
  @ApiOkResponse({ description: 'School retrieved successfully' })
  @ApiNotFoundResponse({ description: 'School not found' })
  findOne(@Param('id') id: string) {
    return this.schoolsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a school by ID' })
  @ApiOkResponse({ description: 'School updated successfully' })
  @ApiNotFoundResponse({ description: 'School not found' })
  update(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.schoolsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a school by ID' })
  @ApiOkResponse({ description: 'School deleted successfully' })
  @ApiNotFoundResponse({ description: 'School not found' })
  remove(@Param('id') id: string) {
    return this.schoolsService.remove(id);
  }
}
