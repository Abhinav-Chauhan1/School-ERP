import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "term"
    | "academicYear";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
};

const FormContainer = async ({ table, type, data, id, relatedData: passedRelatedData }: FormContainerProps) => {
  let relatedData = passedRelatedData || {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });

        // Fetch departments for department dropdown
        const departments = await prisma.department.findMany({
          select: { id: true, name: true },
        });

        // Fetch academic years for academic year dropdown
        const academicYears = await prisma.academicYear.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        });

        relatedData = {
          subjects: teacherSubjects,
          departments: departments,
          academicYears: academicYears,
        };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });

        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });

        // Fetch sections for all classes
        const studentSections = await prisma.section.findMany({
          select: {
            id: true,
            name: true,
            classId: true,
          },
        });

        // Fetch parents for parent dropdown
        const parents = await prisma.parent.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
          where: {
            status: "ACTIVE",
          },
        });

        relatedData = {
          classes: studentClasses,
          grades: studentGrades,
          sections: studentSections,
          parents: parents,
        };
        break;

      case "parent":
        // Fetch students for the parent association display
        const availableStudents = await prisma.student.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
            parentId: true,
          },
          where: {
            // Optionally only show unassigned students or those belonging to this parent
            OR: [
              { parentId: data?.id || '' },
              { parentId: '' }
            ]
          },
        });
        
        relatedData = { students: availableStudents };
        break;

      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
      case "term":
        if (!relatedData.academicYears) {
          const academicYears = await prisma.academicYear.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          });
          relatedData = { ...relatedData, academicYears };
        }
        break;
      case "academicYear":
        // No specific related data needed for academic year
        break;

      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
