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
    | "academicYear"
    | "department"
    | "grade"
    | "section"
    | "curriculum"
    | "syllabus"
    | "examType"
    | "reportCard"
    | "feeStructure"
    | "feePayment"
    | "payroll"
    | "room"
    | "parentMeeting"
    | "expense"
    | "budget"; // Add budget to the allowed table types
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
      case "section":
        // Fetch all classes for the section form dropdown
        if (!relatedData.classes) {
          const classes = await prisma.class.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          });
          relatedData = { ...relatedData, classes };
        }
        break;

      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        
        // Add departments query for subjects
        const subjectDepartments = await prisma.department.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        });
        
        relatedData = { 
          teachers: subjectTeachers,
          departments: subjectDepartments 
        };
        break;
      case "class":
        // If we don't have the related data already passed in
        if (!relatedData.teachers || !relatedData.grades || !relatedData.academicYears) {
          const [classGrades, classTeachers, classAcademicYears] = await Promise.all([
            prisma.grade.findMany({
              select: { id: true, level: true },
              orderBy: { level: 'asc' },
            }),
            prisma.teacher.findMany({
              select: { id: true, name: true, surname: true },
              orderBy: { name: 'asc' },
            }),
            prisma.academicYear.findMany({
              select: { id: true, name: true },
              orderBy: { name: 'asc' },
            })
          ]);
          
          relatedData = { 
            ...relatedData,
            teachers: relatedData.teachers || classTeachers, 
            grades: relatedData.grades || classGrades,
            academicYears: relatedData.academicYears || classAcademicYears 
          };
        }
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
        // Fetch lessons, exam types and terms for exam form
        const [examLessons, examTypes, terms] = await Promise.all([
          prisma.lesson.findMany({
            where: {
              ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
            },
            select: { 
              id: true, 
              name: true,
              subject: { select: { name: true } },
              class: { select: { name: true } }
            },
            orderBy: { name: 'asc' },
          }),
          prisma.examType.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          }),
          prisma.term.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          })
        ]);
        
        relatedData = { 
          lessons: examLessons,
          examTypes: examTypes,
          terms: terms
        };
        break;
      case "assignment":
        // Fetch lessons for assignment form
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { 
            id: true, 
            name: true,
            subject: { select: { name: true } },
            class: { select: { name: true } }
          },
          orderBy: { name: 'asc' },
        });
        
        relatedData = { lessons: assignmentLessons };
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
      case "department":
        // No specific related data needed for department
        break;
      case "grade":
        // No specific related data needed for grade
        break;
      case "curriculum":
        // Fetch grades, academic years, and subjects for curriculum forms
        const [curriculumGrades, curriculumAcademicYears, curriculumSubjects] = await Promise.all([
          prisma.grade.findMany({
            select: { id: true, level: true },
            orderBy: { level: 'asc' },
          }),
          prisma.academicYear.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          }),
          prisma.subject.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          })
        ]);
        
        relatedData = {
          grades: curriculumGrades,
          academicYears: curriculumAcademicYears,
          subjects: curriculumSubjects
        };
        break;
      case "syllabus":
        // Fetch subjects for syllabus form
        const subjects = await prisma.subject.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        });
        
        relatedData = { subjects };
        break;
      case "lesson":
        // Fetch related data for lesson form dropdowns
        const [lessonSubjects, lessonClasses, lessonTeachers, lessonRooms] = await Promise.all([
          prisma.subject.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          }),
          prisma.class.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
          }),
          prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
            orderBy: { name: 'asc' },
          }),
          prisma.room.findMany({
            select: { id: true, name: true },
            where: { available: true },
            orderBy: { name: 'asc' },
          }),
        ]);
        
        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          teachers: lessonTeachers,
          rooms: lessonRooms
        };
        break;
      case "examType":
        // No specific related data needed for exam type
        break;
      case "result":
        // Fetch data needed for the result form
        const [resultStudents, resultExams, resultAssignments, resultReportCards] = await Promise.all([
          prisma.student.findMany({
            select: { 
              id: true, 
              name: true, 
              surname: true 
            },
            orderBy: [
              { surname: 'asc' },
              { name: 'asc' }
            ],
          }),
          prisma.exam.findMany({
            where: {
              ...(role === "teacher" ? { lesson: { teacherId: currentUserId! } } : {}),
            },
            select: { 
              id: true, 
              title: true,
              totalMarks: true,
              passingMarks: true,
              hasGrading: true,
              examType: {
                select: {
                  id: true,
                  name: true,
                  hasPractical: true
                }
              }
            },
            orderBy: { startTime: 'desc' },
          }),
          prisma.assignment.findMany({
            where: {
              ...(role === "teacher" ? { lesson: { teacherId: currentUserId! } } : {}),
            },
            select: { 
              id: true, 
              title: true,
              totalMarks: true,
            },
            orderBy: { dueDate: 'desc' },
          }),
          prisma.reportCard.findMany({
            select: { 
              id: true,
              student: { 
                select: { 
                  id: true, 
                  name: true, 
                  surname: true 
                } 
              },
              term: { 
                select: { 
                  id: true, 
                  name: true 
                } 
              }
            },
            orderBy: { issueDate: 'desc' },
          })
        ]);
        
        relatedData = { 
          students: resultStudents,
          exams: resultExams,
          assignments: resultAssignments,
          reportCards: resultReportCards
        };
        break;
      case "reportCard":
        // Fetch data needed for the report card form
        const [reportCardStudents, reportCardTerms, reportCardResults] = await Promise.all([
          prisma.student.findMany({
            select: { 
              id: true, 
              name: true, 
              surname: true 
            },
            orderBy: [
              { surname: 'asc' },
              { name: 'asc' }
            ],
          }),
          prisma.term.findMany({
            select: { 
              id: true, 
              name: true,
              academicYear: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: [
              { academicYear: { name: 'desc' } },
              { name: 'asc' }
            ],
          }),
          prisma.result.findMany({
            where: {
              ...(data?.studentId ? { studentId: data.studentId } : {}),
              reportCardId: null, // Only get results not assigned to any report card
            },
            include: {
              exam: true,
              assignment: true,
              student: {
                select: { name: true, surname: true }
              }
            },
            orderBy: { id: 'desc' },
          })
        ]);
        
        relatedData = { 
          students: reportCardStudents,
          terms: reportCardTerms,
          results: reportCardResults
        };
        break;
      case "attendance":
        // Fetch data needed for the attendance form
        const [attendanceStudents, attendanceLessons] = await Promise.all([
          prisma.student.findMany({
            select: { 
              id: true, 
              name: true, 
              surname: true 
            },
            orderBy: [
              { surname: 'asc' },
              { name: 'asc' }
            ],
          }),
          prisma.lesson.findMany({
            where: {
              ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
            },
            select: { 
              id: true, 
              name: true,
              day: true,
              subject: { select: { name: true } },
              class: { select: { name: true } }
            },
            orderBy: { name: 'asc' },
          })
        ]);
        
        relatedData = { 
          students: attendanceStudents,
          lessons: attendanceLessons
        };
        break;
      case "event":
        // Fetch data needed for the event form
        const [eventClasses, eventRooms] = await Promise.all([
          prisma.class.findMany({
            select: { 
              id: true, 
              name: true 
            },
            orderBy: { name: 'asc' },
          }),
          prisma.room.findMany({
            select: { 
              id: true, 
              name: true,
              type: true,
              capacity: true
            },
            where: { 
              available: true 
            },
            orderBy: { name: 'asc' },
          })
        ]);
        
        relatedData = { 
          classes: eventClasses,
          rooms: eventRooms
        };
        break;
      case "announcement":
        // Fetch data needed for the announcement form
        const announcementClasses = await prisma.class.findMany({
          select: { 
            id: true, 
            name: true 
          },
          orderBy: { name: 'asc' },
        });
        
        relatedData = { 
          classes: announcementClasses 
        };
        break;
      case "feeStructure":
        // Fetch data needed for the fee structure form
        const [feeStructureGrades, feeStructureAcademicYears] = await Promise.all([
          prisma.grade.findMany({
            select: { 
              id: true, 
              level: true 
            },
            orderBy: { level: 'asc' },
          }),
          prisma.academicYear.findMany({
            select: { 
              id: true, 
              name: true 
            },
            orderBy: { name: 'desc' },
            take: 1, // Just to get the current academic year for reference
          })
        ]);
        
        relatedData = { 
          grades: feeStructureGrades,
          academicYears: feeStructureAcademicYears
        };
        break;
      case "feePayment":
        // Fetch data needed for the fee payment form
        const [feePaymentStudents, feePaymentFeeStructures] = await Promise.all([
          prisma.student.findMany({
            select: { 
              id: true, 
              name: true, 
              surname: true 
            },
            orderBy: [
              { surname: 'asc' },
              { name: 'asc' }
            ],
          }),
          prisma.feeStructure.findMany({
            select: { 
              id: true, 
              name: true,
              amount: true,
              feeType: true,
              grade: { 
                select: { 
                  level: true 
                } 
              }
            },
            orderBy: { name: 'asc' },
          })
        ]);
        
        relatedData = { 
          students: feePaymentStudents,
          feeStructures: feePaymentFeeStructures
        };
        break;
      case "payroll":
        // Fetch data needed for the payroll form
        const payrollTeachers = await prisma.teacher.findMany({
          select: { 
            id: true, 
            name: true, 
            surname: true 
          },
          where: {
            status: "ACTIVE"
          },
          orderBy: [
            { surname: 'asc' },
            { name: 'asc' }
          ],
        });
        
        relatedData = { 
          teachers: payrollTeachers
        };
        break;
      case "room":
        // Fetch classes for room assignment
        const roomClasses = await prisma.class.findMany({
          select: { 
            id: true, 
            name: true 
          },
          orderBy: { name: 'asc' },
        });
        
        relatedData = { 
          classes: roomClasses 
        };
        break;

      case "budget":
        // No specific related data needed for budget
        break;

      case "expense":
        // No specific related data needed for expenses
        break;

      case "parentMeeting":
        // Fetch data needed for the parent meeting form
        const [meetingParents, meetingTeachers] = await Promise.all([
          prisma.parent.findMany({
            select: { 
              id: true, 
              name: true, 
              surname: true 
            },
            where: {
              status: "ACTIVE"
            },
            orderBy: [
              { surname: 'asc' },
              { name: 'asc' }
            ],
          }),
          prisma.teacher.findMany({
            select: { 
              id: true, 
              name: true, 
              surname: true 
            },
            where: {
              status: "ACTIVE"
            },
            orderBy: [
              { surname: 'asc' },
              { name: 'asc' }
            ],
          })
        ]);
        
        relatedData = { 
          parents: meetingParents,
          teachers: meetingTeachers
        };
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
