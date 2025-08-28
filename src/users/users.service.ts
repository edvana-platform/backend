/* eslint-disable */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateUserDto, 
  UpdateUserDto,
  CreateTeacherProfileDto,
  CreateStudentProfileDto,
  CreateParentProfileDto,
  AssignParentToStudentDto
} from './dto/user.dto';
import { AssignSchoolDto } from 'src/school/dto/assign-school.dto';
import { Role, Gender, UserStatus } from '@prisma/client';
import * as xlsx from 'xlsx';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

function parseExcelDate(value: any): Date | null {
  if (typeof value === 'number') {
    const excelEpoch = new Date(1900, 0, 1);
    return new Date(excelEpoch.getTime() + (value - 2) * 24 * 60 * 60 * 1000);
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
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          ...(data.phone ? [{ phone: data.phone }] : [])
        ]
      }
    });

    if (existingUser) {
      throw new BadRequestException('User with this email or phone already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create base user
    const user = await this.prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dob: new Date(data.dob),
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
        role: data.role,
        address: data.address,
        schoolId: data.schoolId,
        status: UserStatus.ACTIVE,
      },
      include: {
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
        school: true,
      }
    });

    // Return user with profile
    return this.findOne(user.id);
  }

  async createTeacherProfile(data: CreateTeacherProfileDto) {
    // Verify user exists and is a teacher
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.TEACHER) {
      throw new BadRequestException('User must be a teacher');
    }

    // Check if profile already exists
    const existingProfile = await this.prisma.teacher.findUnique({
      where: { userId: data.userId }
    });

    if (existingProfile) {
      throw new BadRequestException('Teacher profile already exists');
    }

    return this.prisma.teacher.create({
      data: {
        userId: data.userId,
        specialization: data.specialization,
        qualification: data.qualification,
        experience: data.experience,
        subjects: data.subjects,
        customRoles: data.customRoles || [],
      },
      include: {
        user: true,
        classes: true,
      }
    });
  }

  async createStudentProfile(data: CreateStudentProfileDto) {
    // Verify user exists and is a student
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.STUDENT) {
      throw new BadRequestException('User must be a student');
    }

    // Verify class exists
    const classExists = await this.prisma.class.findUnique({
      where: { id: data.classId }
    });

    if (!classExists) {
      throw new NotFoundException('Class not found');
    }

    // Check if profile already exists
    const existingProfile = await this.prisma.student.findUnique({
      where: { userId: data.userId }
    });

    if (existingProfile) {
      throw new BadRequestException('Student profile already exists');
    }

    return this.prisma.student.create({
      data: {
        userId: data.userId,
        classId: data.classId,
        enrollmentDate: new Date(data.enrollmentDate),
      },
      include: {
        user: true,
        class: true,
        parents: {
          include: {
            parent: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
  }

  async createParentProfile(data: CreateParentProfileDto) {
    // Verify user exists and is a parent
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== Role.PARENT) {
      throw new BadRequestException('User must be a parent');
    }

    // Check if national ID is already used
    const existingParent = await this.prisma.parent.findFirst({
      where: { nationalId: data.nationalId }
    });

    if (existingParent) {
      throw new BadRequestException('National ID already in use');
    }

    // Check if profile already exists
    const existingProfile = await this.prisma.parent.findUnique({
      where: { userId: data.userId }
    });

    if (existingProfile) {
      throw new BadRequestException('Parent profile already exists');
    }

    return this.prisma.parent.create({
      data: {
        userId: data.userId,
        nationalId: data.nationalId,
      },
      include: {
        user: true,
        children: {
          include: {
            student: {
              include: {
                user: true,
                class: true
              }
            }
          }
        }
      }
    });
  }

  async assignParentToStudent(data: AssignParentToStudentDto) {
    // Verify parent exists
    const parent = await this.prisma.parent.findUnique({
      where: { userId: data.parentId }
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    // Verify student exists
    const student = await this.prisma.student.findUnique({
      where: { userId: data.studentId }
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if relationship already exists
    const existingRelation = await this.prisma.parentStudent.findFirst({
      where: {
        parentId: data.parentId,
        studentId: data.studentId
      }
    });

    if (existingRelation) {
      throw new BadRequestException('Parent-student relationship already exists');
    }

    return this.prisma.parentStudent.create({
      data: {
        parentId: data.parentId,
        studentId: data.studentId,
        relationship: data.relationship,
        isEmergencyContact: data.isEmergencyContact || false,
      },
      include: {
        parent: {
          include: {
            user: true
          }
        },
        student: {
          include: {
            user: true,
            class: true
          }
        }
      }
    });
  }

  async removeParentFromStudent(parentId: string, studentId: string) {
    const relation = await this.prisma.parentStudent.findFirst({
      where: {
        parentId,
        studentId
      }
    });

    if (!relation) {
      throw new NotFoundException('Parent-student relationship not found');
    }

    return this.prisma.parentStudent.delete({
      where: { id: relation.id }
    });
  }

  findAll() {
    return this.prisma.user.findMany({
      include: {
        teacherProfile: {
          include: {
            classes: true,
          }
        },
        studentProfile: {
          include: {
            class: true,
            parents: {
              include: {
                parent: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        parentProfile: {
          include: {
            children: {
              include: {
                student: {
                  include: {
                    user: true,
                    class: true
                  }
                }
              }
            }
          }
        },
        school: true,
      }
    });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ 
      where: { id },
      include: {
        teacherProfile: {
          include: {
            classes: true,
          }
        },
        studentProfile: {
          include: {
            class: true,
            parents: {
              include: {
                parent: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        parentProfile: {
          include: {
            children: {
              include: {
                student: {
                  include: {
                    user: true,
                    class: true
                  }
                }
              }
            }
          }
        },
        school: true,
      }
    });
  }

  findByEmail(email: string) {
    if (!email) return null;
    return this.prisma.user.findUnique({ 
      where: { email },
      include: {
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
        school: true,
      }
    });
  }

  findByPhone(phone: string) {
    if (!phone) return null;
    return this.prisma.user.findUnique({ 
      where: { phone },
      include: {
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
        school: true,
      }
    });
  }

  async update(id: string, data: UpdateUserDto) {
    // Check if user exists
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if updating
    if (data.email && data.email !== user.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email }
      });
      if (emailExists) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Check phone uniqueness if updating
    if (data.phone && data.phone !== user.phone) {
      const phoneExists = await this.prisma.user.findUnique({
        where: { phone: data.phone }
      });
      if (phoneExists) {
        throw new BadRequestException('Phone already in use');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      include: {
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
        school: true,
      }
    });
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({ 
      where: { id },
      include: {
        teacherProfile: true,
        studentProfile: true,
        parentProfile: true,
      }
    });
  }

  async updatePassword(userId: string, newHashedPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });
  }

  async getTeachers() {
    return this.prisma.user.findMany({
      where: { role: Role.TEACHER },
      include: {
        teacherProfile: {
          include: {
            classes: true,
          }
        },
        school: true,
      }
    });
  }

  async getStudents() {
    return this.prisma.user.findMany({
      where: { role: Role.STUDENT },
      include: {
        studentProfile: {
          include: {
            class: true,
            parents: {
              include: {
                parent: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        },
        school: true,
      }
    });
  }

  async getParents() {
    return this.prisma.user.findMany({
      where: { role: Role.PARENT },
      include: {
        parentProfile: {
          include: {
            children: {
              include: {
                student: {
                  include: {
                    user: true,
                    class: true
                  }
                }
              }
            }
          }
        },
      }
    });
  }

  async getStudentsByParent(parentUserId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentUserId },
      include: {
        children: {
          include: {
            student: {
              include: {
                user: true,
                class: true
              }
            }
          }
        }
      }
    });

    if (!parent) {
      throw new NotFoundException('Parent not found');
    }

    return parent.children.map(relation => relation.student);
  }

  async getParentsByStudent(studentUserId: string) {
    const student = await this.prisma.student.findUnique({
      where: { userId: studentUserId },
      include: {
        parents: {
          include: {
            parent: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student.parents.map(relation => relation.parent);
  }

  async importFromExcel(filePath: string) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const [index, row] of data.entries()) {
      try {
        const {
          first_name,
          last_name,
          gender,
          dob,
          email,
          phone,
          role,
          address,
          school_id,
          // Teacher fields
          specialization,
          qualification,
          experience,
          subjects,
          // Student fields
          class_id,
          enrollment_date,
          // Parent fields
          national_id,
        } = row as any;

        if (!first_name || !last_name || !email || !dob || !role || !gender) {
          results.errors.push(`Row ${index + 2}: Missing required fields`);
          results.failed++;
          continue;
        }

        const parsedDob = parseExcelDate(dob);
        if (!parsedDob) {
          results.errors.push(`Row ${index + 2}: Invalid DOB format`);
          results.failed++;
          continue;
        }

        const existingUser = await this.prisma.user.findFirst({
          where: {
            OR: [
              { email },
              ...(phone ? [{ phone }] : [])
            ]
          }
        });

        if (existingUser) {
          results.errors.push(`Row ${index + 2}: User already exists`);
          results.failed++;
          continue;
        }

        const generatedPassword = uuidv4().split('-')[0];

        const createData: CreateUserDto = {
          firstName: first_name,
          lastName: last_name,
          gender: gender as Gender,
          dob: parsedDob.toISOString(),
          email,
          phone,
          password: generatedPassword,
          role: role as Role,
          address,
          schoolId: school_id,
        };

        await this.create(createData);
        results.successful++;

      } catch (error) {
        results.errors.push(`Row ${index + 2}: ${error.message}`);
        results.failed++;
      }
    }

    return {
      message: `Import completed. ${results.successful} successful, ${results.failed} failed.`,
      ...results
    };
  }

  async assignSchool(dto: AssignSchoolDto) {
    const { userId, schoolId, role } = dto;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const school = await this.prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    if (![Role.TEACHER, Role.STUDENT, Role.SCHOOL_ADMIN].includes(role as any)) {
      throw new BadRequestException('Only TEACHER, STUDENT, or SCHOOL_ADMIN can be assigned to a school');
    }

    return await this.prisma.user.update({
      where: { id: userId },
      data: { schoolId: schoolId },
      include: {
        school: true,
        teacherProfile: true,
        studentProfile: true,
      }
    });
  }
}