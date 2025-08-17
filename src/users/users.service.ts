/* eslint-disable */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import { BadRequestException } from '@nestjs/common';
import { AssignSchoolDto } from 'src/school/dto/assign-school.dto';
import { Class, Role, Gender } from '@prisma/client';
import * as xlsx from 'xlsx';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

function parseExcelDate(value: any): Date | null {
  // Handle Excel serial date (e.g., 44220) OR string (e.g., "4/4/2011")
  if (typeof value === 'number') {
    const excelEpoch = new Date(1900, 0, 1);
    return new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000); // Excel bug fix: subtract 2
  }

  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

async create(data: CreateUserDto) {
  // Validation rules
  if ((data.role === 'ADMIN' || data.role === 'PARENT') && data.class?.length) {
    throw new BadRequestException('ADMIN or PARENT cannot have classes');
  }

  if (data.role === 'STUDENT' && data.class?.length !== 1) {
    throw new BadRequestException('STUDENT must have exactly one class');
  }

  if (data.role === 'TEACHER' && (!data.class || data.class.length === 0)) {
    throw new BadRequestException('TEACHER must have at least one class');
  }
  const school = await this.prisma.school.findUnique({ where: { name: data.schoolName } });


  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Prepare user data
  const userData: any = {
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    dob: new Date(data.dob),
    email: data.email,
    phone: data.phone,
    password: hashedPassword,
    role: data.role,
    address: data.address,
    studentStream: data.studentStream,
    schoolName: data.schoolName,
    studentId: data.studentId,
    parentPhone: data.parentPhone,
  };

  if (data.role === 'STUDENT' && school) {
    userData.schoolId = school.id; // store id for students
  } else if (data.role === 'TEACHER' && school) {
    userData.schoolName = school.name; // store name for teachers
  }
  // Add class info
  if (data.role === 'STUDENT' && data.class?.length === 1) {
    userData.studentClass = data.class[0];
  } else if (data.role === 'TEACHER') {
    userData.teacherClasses = { set: data.class };
  }

  // Create user (no relation connect here to avoid FK error)
  const newUser = await this.prisma.user.create({ data: userData });

  return newUser;
}


  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
  findByPhone(phone: string){
    return this.prisma.user.findUnique({where:{phone}})
  }
  async updatePassword(userId: string, newHashedPassword: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { password: newHashedPassword },
  });
}


async importFromExcel(filePath: string) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet);

  const users = await Promise.all(
    data.map(async (row: any, index: number) => {
      const {
        first_name,
        last_name,
        gender,
        dob,
        email,
        phone,
        role,
        class: userClass,
        stream,
        parent_phone,
        student_id,
        school_name,
        address,
      } = row;

      if (!first_name || !last_name || !email || !dob || !role || !gender || !address) {
        console.warn(`⛔ Skipping row ${index + 2}: Missing required fields`);
        return null;
      }

      const parsedDob = parseExcelDate(dob);
      if (!parsedDob) {
        console.warn(`⚠️ Invalid DOB format in row ${index + 2}`);
        return null;
      }

      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) return null;

      const school = school_name
        ? await this.prisma.school.findFirst({ where: { name: school_name } })
        : null;

      if (school_name && !school) {
        console.warn(`⚠️ School not found for row ${index + 2}`);
        return null;
      }

      const generatedPassword = uuidv4().split('-')[0];
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      const createdUser = await this.prisma.user.create({
        data: {
          firstName: first_name,
          lastName: last_name,
          gender: gender as Gender,
          dob: parsedDob,
          email,
          phone,
          password: hashedPassword,
          address,
          studentId: student_id,
          role: role as Role,
          studentClass: role === 'STUDENT' ? (userClass as Class) : undefined,
          studentStream: role === 'STUDENT' ? stream : undefined,
          teacherClasses: role === 'TEACHER' && userClass ? [userClass as Class] : [],
          parentPhone: role === 'STUDENT' ? parent_phone : undefined,
          schoolId: role === 'STUDENT' ? school?.id : undefined,
          schoolName: role === 'TEACHER' ? school?.name : undefined,
        },
      });

      return createdUser;
    }),
  );

  return {
    message: '✅ Users uploaded successfully with temporary passwords.',
    created: users.filter(Boolean).length,
  };
}


async assignSchool(dto: AssignSchoolDto) {
  const { userId, schoolId, role } = dto;

  const user = await this.prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundException('User not found');

  const school = await this.prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) throw new NotFoundException('School not found');

  if (role === 'TEACHER') {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { schoolName: school.name },
    });
  }

  if (role === 'STUDENT') {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { schoolName: school.name },
    });
  }

  throw new BadRequestException('Only STUDENT or TEACHER can be assigned to a school');
}

}