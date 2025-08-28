import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';


/** Card (list) view DTO */
export class SubjectCardDto {
  @ApiProperty({ description: 'Subject ID' })
  id: string;

  @ApiProperty({ description: 'Subject name' })
  name: string;
  
  @ApiProperty({ description: 'Subject name' })
  @IsOptional()
  code: string | null;

  @ApiProperty({ description: 'Class level' })
  gradeId: string;

  @ApiProperty({ description: 'Subject description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Duration in weeks', nullable: true })
  durationWeeks: number | null;

  @ApiProperty({ description: 'Teacher full name', nullable: true })
  teacherName: string | null;

  @ApiProperty({ description: 'Total number of lessons' })
  lessonsTotal: number;

  @ApiProperty({ description: 'Number of completed lessons' })
  lessonsCompleted: number;

  @ApiProperty({ description: 'Progress percentage' })
  progressPct: number;
}

/** Detail view DTO (extends Card) */
export class SubjectDetailDto extends SubjectCardDto {
  @ApiProperty({
    description: 'Subject topics',
    type: [Object],
    example: [{ id: 'uuid', name: 'Topic Name' }],
  })
  topics: { id: string; name: string }[];

  @ApiProperty({ description: 'Course files', type: [Object] })
  files: {
    id: string;
    title: string;
    description: string | null;
    fileUrl: string;
    uploadedBy: { id: string; firstName: string; lastName: string } | null;
    createdAt: Date;
  }[];
}

/** Create DTO  */
export class CreateSubjectDto {
  @ApiProperty({ description: 'Subject name', example: 'Mathematics' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Subject code', example: 'SS0123' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Class level', example: "S1" })
  @IsString()
  gradeId: string; // Prisma column is string

  @ApiPropertyOptional({ description: 'Subject description', example: 'Advanced mathematics course' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Duration in weeks', example: 12 })
  @IsOptional() @IsNumber()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  durationWeeks?: number;

  @ApiPropertyOptional({ description: 'Teacher user ID (FK to User.id)', example: 'uuid' })
  @IsOptional() @IsString()
  userId?: string;
}

/** Update DTO (same idea: string + enum validator) */
export class UpdateSubjectDto {
  @ApiPropertyOptional({ description: 'Subject name', example: 'Mathematics' })
  @IsOptional() @IsString()
  name?: string;

  @ApiProperty({ description: 'Subject code', example: 'SS01234' })
  @IsString()
  code: string;

  @ApiPropertyOptional({description: 'Class level', example: "S1" })
  @IsOptional()
  class?: string;

  @ApiPropertyOptional({ description: 'Subject description', example: 'Advanced mathematics course' })
  @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Duration in weeks', example: 12 })
  @IsOptional() @IsNumber()
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  durationWeeks?: number;

  @ApiPropertyOptional({ description: 'Teacher user ID (FK to User.id)', example: 'uuid' })
  @IsOptional() @IsString()
  userId?: string;
}

/** Create Topic DTO */
export class CreateTopicDto {
  @ApiProperty({ description: 'Topic name', example: 'Calculus' })
  @IsString()
  name: string;
}

/** Multipart upload metadata (used by subject/topic file uploads) */
export class UploadFileMetaDto {
  @ApiProperty({ example: 'Chapter 1: Limits' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Slides on Limits' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'user-uuid-of-uploader' })
  @IsOptional()
  @IsString()
  uploaderId?: string; // if you pull from auth, you can omit from body
}
