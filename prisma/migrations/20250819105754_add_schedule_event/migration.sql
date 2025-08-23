-- CreateEnum
CREATE TYPE "ScheduleAudience" AS ENUM ('PUBLIC', 'STUDENTS', 'TEACHERS', 'CLASS_ONLY', 'PRIVATE');

-- CreateTable
CREATE TABLE "ScheduleEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "audience" "ScheduleAudience" NOT NULL DEFAULT 'PUBLIC',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "subjectId" TEXT,
    "targetClass" "Class",
    "teacherName" TEXT,
    "subjectName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleEvent_startsAt_idx" ON "ScheduleEvent"("startsAt");

-- CreateIndex
CREATE INDEX "ScheduleEvent_createdById_idx" ON "ScheduleEvent"("createdById");

-- CreateIndex
CREATE INDEX "ScheduleEvent_subjectId_idx" ON "ScheduleEvent"("subjectId");

-- CreateIndex
CREATE INDEX "ScheduleEvent_targetClass_idx" ON "ScheduleEvent"("targetClass");

-- AddForeignKey
ALTER TABLE "ScheduleEvent" ADD CONSTRAINT "ScheduleEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEvent" ADD CONSTRAINT "ScheduleEvent_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
