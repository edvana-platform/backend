/* eslint-disable */
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateIf, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

function parseStringArray(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // fallback: split by comma if JSON.parse fails
      return value.split(',').map(v => v.trim());
    }
  }
  return [];
}

export class CreateResourceDto {
  @ApiProperty({ example: 'Introduction to Algebra' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Covers basic algebra topics' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/resource.pdf' })
  @ValidateIf((obj) => !obj.file) // validate only if no file is uploaded
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({ example: 'PDF' })
  @IsNotEmpty()
  @IsString()
  resourceType: string;

  @ApiProperty({ example: 'subject-id-uuid' })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  subjectId: string;

  @ApiProperty({ 
    example: ['grade-id-1-uuid', 'grade-id-2-uuid'], 
    description: 'Array of grade IDs this resource applies to' 
  })
  @IsNotEmpty()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => parseStringArray(value))
  gradeIds: string[];

  @ApiProperty({ example: ['Algebra', 'Math'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseStringArray(value))
  tags?: string[];

  @ApiProperty({ example: 'Active' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdateResourceDto {
  @ApiProperty({ example: 'Advanced Algebra' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Covers quadratic equations' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/advanced.pdf' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  file?: Express.Multer.File;

  @ApiProperty({ example: 'PDF' })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiProperty({ example: 'subject-id-uuid' })
  @IsOptional()
  @IsString()
  @IsUUID()
  subjectId?: string;

  @ApiProperty({ 
    example: ['grade-id-1-uuid', 'grade-id-2-uuid'], 
    description: 'Array of grade IDs this resource applies to' 
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => parseStringArray(value))
  gradeIds?: string[];

  @ApiProperty({ example: ['Algebra'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => parseStringArray(value))
  tags?: string[];

  @ApiProperty({ example: 'Inactive' })
  @IsOptional()
  @IsString()
  status?: string;
}
