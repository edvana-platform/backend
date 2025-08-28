/* eslint-disable */
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  UploadedFile, 
  UseInterceptors, 
  Patch,
  Query
} from '@nestjs/common';
import { UsersService } from './users.service';
import { 
  CreateUserDto, 
  UpdateUserDto,
  CreateTeacherProfileDto,
  CreateStudentProfileDto,
  CreateParentProfileDto
} from './dto/user.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '@prisma/client';
import { 
  ApiTags, 
  ApiBearerAuth,
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiConsumes,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AssignSchoolDto } from 'src/school/dto/assign-school.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user with role-specific profile' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all users with their profiles' })
  @ApiResponse({ status: 200, description: 'List of users with profiles' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get('teachers')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'List of teachers' })
  getTeachers() {
    return this.usersService.getTeachers();
  }

  @Get('students')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'List of students' })
  getStudents() {
    return this.usersService.getStudents();
  }

  @Get('parents')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Get all parents' })
  @ApiResponse({ status: 200, description: 'List of parents' })
  getParents() {
    return this.usersService.getParents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID with profile' })
  @ApiResponse({ status: 200, description: 'User details with profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update user information' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Delete a user and their profile' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden (requires ADMIN role)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // Profile-specific endpoints
  @Post('teachers/profile')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create teacher profile for existing user' })
  @ApiResponse({ status: 201, description: 'Teacher profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - user must be a teacher' })
  createTeacherProfile(@Body() dto: CreateTeacherProfileDto) {
    return this.usersService.createTeacherProfile(dto);
  }

  @Post('students/profile')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create student profile for existing user' })
  @ApiResponse({ status: 201, description: 'Student profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - user must be a student' })
  createStudentProfile(@Body() dto: CreateStudentProfileDto) {
    return this.usersService.createStudentProfile(dto);
  }

  @Post('parents/profile')
  @Roles(Role.SUPER_ADMIN, Role.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create student profile for existing user' })
  @ApiResponse({ status: 201, description: 'Student profile created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - user must be a student' })
  createParentProfile(@Body() dto: CreateParentProfileDto) {
    return this.usersService.createParentProfile(dto);
  }
}