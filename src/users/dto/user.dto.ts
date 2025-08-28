/* eslint-disable */
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
  IsArray,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsDateString,
  MinLength,
  IsBoolean
} from 'class-validator';
import { Role, Gender } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'MALE' })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: '2005-09-15' })
  @IsDateString()
  dob: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0780000000', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'STUDENT' })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({ example: 'Kigali', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'school-uuid-here', required: false })
  @IsOptional()
  @IsString()
  schoolId?: string;

}

export class UpdateUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @ApiProperty({ example: 'MALE', required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 'john.updated@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '0780000001', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Kigali, Updated Address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'ACTIVE', required: false })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}

export class AssignParentToStudentDto {
  @ApiProperty({ example: 'parent-user-uuid' })
  @IsUUID()
  parentId: string;

  @ApiProperty({ example: 'student-user-uuid' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: 'father', required: false })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isEmergencyContact?: boolean;
}

export class CreateTeacherProfileDto {
  @ApiProperty({ example: 'teacher-user-uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: ['Mathematics', 'Physics'] })
  @IsArray()
  @IsString({ each: true })
  specialization: string[];

  @ApiProperty({ example: 'Master in Mathematics Education' })
  @IsString()
  qualification: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(0)
  @Max(50)
  experience: number;

  @ApiProperty({ example: ['Mathematics', 'Physics'] })
  @IsArray()
  @IsString({ each: true })
  subjects: string[];

  @ApiProperty({ example: ['Head of Department'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customRoles?: string[];
}

export class CreateStudentProfileDto {
  @ApiProperty({ example: 'student-user-uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'class-uuid' })
  @IsUUID()
  classId: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  enrollmentDate: string;
}

export class CreateParentProfileDto {
  @ApiProperty({ example: 'parent-user-uuid' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: '1234567890123456' })
  @IsString()
  nationalId: string;
}

export class LoginUserDto {
  @ApiProperty({
    example: 'user@example.com',
    required: false,
    description: 'Either email or phone must be provided'
  })
  @ValidateIf(o => !o.phone)
  @IsString({ message: 'Email must be a string' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({
    example: '+1234567890',
    required: false
  })
  @ValidateIf(o => !o.email)
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @ApiProperty({
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'example@mail.com',
    required: false
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'mail@mail.co',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '11111',
  })
  @IsString()
  otp: string;

  @ApiProperty({
    example: 'Password123!',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class LogoutDto {
  @ApiProperty({
    example: "token"
  })
  @IsString()
  token: string;
}