/* eslint-disable */
import {
  PrismaClient,
  Role,
  Class,
  QuizType,
  Status,
  QuestionType,
  MCQ,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const school = await prisma.school.upsert({
    where: { email: 'greenvalley@school.rw' },
    update: {},
    create: {
      name: 'Green Valley School',
      email: 'greenvalley@school.rw',
      phone: '+250788000111',
      address: 'Kigali, Rwanda',
    },
  });

  // 2. Create Teacher
  const teacherPassword = await bcrypt.hash('teach123', 10);
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@greenvalley.rw' },
    update: {},
    create: {
      name: 'Mr. Jean Dusenge',
      email: 'teacher@greenvalley.rw',
      password: teacherPassword,
      role: Role.TEACHER,
      class: [Class.S2],
      schoolId: school.id,
    },
  });

  // 3. Create Student
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@greenvalley.rw' },
    update: {},
    create: {
      name: 'Alice Uwase',
      email: 'student@greenvalley.rw',
      password: studentPassword,
      role: Role.STUDENT,
      class: [Class.S2],
      studentSchoolId: school.id,
    },
  });

  // 4. CBC-Aligned REB Subjects
  const subjects = await prisma.subject.createMany({
    data: [
      { name: 'Mathematics', class: Class.S2 },
      { name: 'Biology', class: Class.S2 },
      { name: 'English', class: Class.S2 },
    ],
    skipDuplicates: true,
  });

  const math = await prisma.subject.findFirst({ where: { name: 'Mathematics' } });

  // 5. Topics under Mathematics
  await prisma.topic.createMany({
    data: [
      { name: 'Algebra', subjectId: math!.id },
      { name: 'Geometry', subjectId: math!.id },
      { name: 'Probability', subjectId: math!.id },
    ],
    skipDuplicates: true,
  });

  // 6. Sample Quiz by teacher
  const quiz = await prisma.quiz.create({
    data: {
      quizName: 'S2 Math Term 1 Mock',
      quizType: QuizType.OPEN,
      class: Class.S2,
      description: 'AI-generated revision for S2 Mathematics',
      quizInstructions: 'Answer all questions carefully.',
      teacherId: teacher.id,
      status: Status.PUBLISHED,
      startTime: new Date(),
      endTime: new Date(Date.now() + 1000 * 60 * 60), // +1hr
    },
  });

  // 7. Questions for the Quiz
  await prisma.question.createMany({
    data: [
      {
        questionBody: 'What is the value of x in 2x + 3 = 7?',
        questionType: QuestionType.MCQ,
        optionA: '1',
        optionB: '2',
        optionC: '3',
        optionD: '4',
        multiple_choice_answer: MCQ.B,
        quizQuizId: quiz.quizId,
        maximumPoints: 5,
      },
      {
        questionBody: 'Define Probability in your own words.',
        questionType: QuestionType.OPEN_ENDED,
        open_ended_answer: 'Probability is the measure of likelihood of an event.',
        quizQuizId: quiz.quizId,
        maximumPoints: 10,
      },
      {
        questionBody: 'True or False: A triangle has four sides.',
        questionType: QuestionType.TRUE_FALSE,
        true_false_answer: false,
        quizQuizId: quiz.quizId,
        maximumPoints: 3,
      },
    ],
  });

  console.log('✅ Seed complete: school, users, curriculum, quiz, questions.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
