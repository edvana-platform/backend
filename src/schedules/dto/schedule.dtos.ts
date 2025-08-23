import {
  IsUUID,
  IsString,
  IsOptional,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Mirror Prisma enum */
export enum ScheduleAudience {
  PUBLIC = 'PUBLIC',
  STUDENTS = 'STUDENTS',
  TEACHERS = 'TEACHERS',
  CLASS_ONLY = 'CLASS_ONLY',
  PRIVATE = 'PRIVATE',
}

/** Your existing Class enum as TS union for validation */
export type SchoolClass =
  | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6'
  | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';

/** ---------- Create DTO ---------- */
export class CreateScheduleDto {
  @ApiProperty({ example: 'Mathematics' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Algebra – Quadratic equations' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'A101' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ enum: ScheduleAudience, default: ScheduleAudience.PUBLIC })
  @IsEnum(ScheduleAudience)
  audience: ScheduleAudience = ScheduleAudience.PUBLIC;

  @ApiProperty({ example: '2025-08-19T08:00:00.000Z' })
  @IsISO8601()
  startsAt: string;

  @ApiProperty({ example: '2025-08-19T08:45:00.000Z' })
  @IsISO8601()
  endsAt: string;

  @ApiProperty({ description: 'User ID of the creator' })
  @IsUUID()
  createdById: string;

  @ApiPropertyOptional({ description: 'Link to Subject (optional)' })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Visible only to this class if CLASS_ONLY',
    enum: ['P1','P2','P3','P4','P5','P6','S1','S2','S3','S4','S5','S6'],
  })
  @IsOptional()
  @IsEnum(
    { P1:'P1',P2:'P2',P3:'P3',P4:'P4',P5:'P5',P6:'P6',S1:'S1',S2:'S2',S3:'S3',S4:'S4',S5:'S5',S6:'S6' },
    { message: 'targetClass must be one of P1..P6 or S1..S6' },
  )
  targetClass?: SchoolClass;

  @ApiPropertyOptional({ example: 'Mr. Rwema' })
  @IsString()
  @IsOptional()
  teacherName?: string;

  @ApiPropertyOptional({ example: 'Mathematics' })
  @IsString()
  @IsOptional()
  subjectName?: string;
}

/** ---------- Update DTO (partial) ---------- */
export class UpdateScheduleDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(ScheduleAudience)
  @IsOptional()
  audience?: ScheduleAudience;

  @IsISO8601()
  @IsOptional()
  startsAt?: string;

  @IsISO8601()
  @IsOptional()
  endsAt?: string;

  @IsUUID()
  @IsOptional()
  createdById?: string;

  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @IsEnum(
    { P1:'P1',P2:'P2',P3:'P3',P4:'P4',P5:'P5',P6:'P6',S1:'S1',S2:'S2',S3:'S3',S4:'S4',S5:'S5',S6:'S6' },
  )
  @IsOptional()
  targetClass?: SchoolClass;

  @IsString()
  @IsOptional()
  teacherName?: string;

  @IsString()
  @IsOptional()
  subjectName?: string;
}

/** ---------- Query/Filter DTO ---------- */
export class QueryScheduleDto {
  @ApiPropertyOptional({ description: 'Inclusive UTC start (ISO)' })
  @IsISO8601()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'Exclusive UTC end (ISO)' })
  @IsISO8601()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({ description: 'Subject ID filter' })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional({ description: 'Creator ID filter' })
  @IsUUID()
  @IsOptional()
  createdById?: string;

  @ApiPropertyOptional({ enum: ScheduleAudience })
  @IsEnum(ScheduleAudience)
  @IsOptional()
  audience?: ScheduleAudience;

  @ApiPropertyOptional({
    description: 'Filter/visibility by class',
    enum: ['P1','P2','P3','P4','P5','P6','S1','S2','S3','S4','S5','S6'],
  })
  @IsEnum(
    { P1:'P1',P2:'P2',P3:'P3',P4:'P4',P5:'P5',P6:'P6',S1:'S1',S2:'S2',S3:'S3',S4:'S4',S5:'S5',S6:'S6' },
  )
  @IsOptional()
  targetClass?: SchoolClass;

  @ApiPropertyOptional({ description: 'Viewer userId to enforce audience' })
  @IsUUID()
  @IsOptional()
  viewerId?: string;

  @ApiPropertyOptional({
    description: 'Viewer class to enforce CLASS_ONLY',
    enum: ['P1','P2','P3','P4','P5','P6','S1','S2','S3','S4','S5','S6'],
  })
  @IsEnum(
    { P1:'P1',P2:'P2',P3:'P3',P4:'P4',P5:'P5',P6:'P6',S1:'S1',S2:'S2',S3:'S3',S4:'S4',S5:'S5',S6:'S6' },
  )
  @IsOptional()
  viewerClass?: SchoolClass;

  @ApiPropertyOptional({ description: 'Free text search', example: 'Math' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Limit to a particular day (ISO, UTC midnight recommended)',
  })
  @IsISO8601()
  @IsOptional()
  day?: string;
}
