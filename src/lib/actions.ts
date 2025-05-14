"use server";

import { revalidatePath } from "next/cache";
import {
  AcademicYearSchema,
  AdminSchema,
  AnnouncementSchema,
  AssignmentSchema,
  AttendanceSchema,
  BudgetSchema,
  ClassSchema,
  CurriculumSchema,
  DepartmentSchema,
  DocumentSchema,
  EventSchema,
  ExamSchema,
  ExamTypeSchema,
  ExpenseSchema,
  FeePaymentSchema,
  FeeStructureSchema,
  GradeSchema,
  LessonSchema,
  MessageSchema,
  NotificationSchema,
  ParentMeetingSchema,
  ParentSchema,
  PayrollSchema,
  ReportCardSchema,
  ResultSchema,
  RoomSchema,
  ScholarshipSchema,
  SectionSchema,
  StudentSchema,
  SubjectSchema,
  SyllabusSchema,
  TeacherSchema,
  TermSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import bcrypt from "bcryptjs";
import cuid from "cuid";

type CurrentState = { success: boolean; error: boolean };

// SUBJECT ACTIONS
export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
        ...(data.departmentId && { department: { connect: { id: data.departmentId } } }),
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
        ...(data.departmentId ? 
          { department: { connect: { id: data.departmentId } } } : 
          { department: { disconnect: true } }),
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// CLASS ACTIONS
export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        grade: { connect: { id: data.gradeId } },
        ...(data.supervisorId && { supervisor: { connect: { id: data.supervisorId } } }),
        ...(data.academicYearId && { academicYear: { connect: { id: data.academicYearId } } }),
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        capacity: data.capacity,
        grade: { connect: { id: data.gradeId } },
        ...(data.supervisorId ? 
          { supervisor: { connect: { id: data.supervisorId } } } : 
          { supervisor: { disconnect: true } }),
        ...(data.academicYearId ? 
          { academicYear: { connect: { id: data.academicYearId } } } : 
          { academicYear: { disconnect: true } }),
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// TEACHER ACTIONS
export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"teacher"}
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        status: data.status || "ACTIVE",
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })) || [],
        },
        ...(data.departmentId && { department: { connect: { id: data.departmentId } } }),
        ...(data.academicYearId && { academicYear: { connect: { id: data.academicYearId } } }),
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        status: data.status || "ACTIVE",
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })) || [],
        },
        ...(data.departmentId ? 
          { department: { connect: { id: data.departmentId } } } : 
          { department: { disconnect: true } }),
        ...(data.academicYearId ? 
          { academicYear: { connect: { id: data.academicYearId } } } : 
          { academicYear: { disconnect: true } }),
      },
    });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// STUDENT ACTIONS
export async function createStudent(prevState: any, formData: StudentSchema) {
  try {
    // Convert sectionId to null if it's an empty string
    const sectionId = formData.sectionId ? Number(formData.sectionId) : null;

    // Make sure to include status in your create data
    const data = {
      id: formData.id || cuid(),
      username: formData.username,
      passwordHash: await bcrypt.hash(formData.password || "default_password", 10),
      name: formData.name,
      surname: formData.surname,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address,
      img: formData.img,
      bloodType: formData.bloodType,
      birthday: formData.birthday,
      sex: formData.sex,
      gradeId: Number(formData.gradeId),
      classId: Number(formData.classId),
      parentId: formData.parentId,
      sectionId: sectionId, 
      status: formData.status || "ACTIVE",
    };

    await prisma.student.create({ data });
    
    return { success: true, error: false };
  } catch (error) {
    console.error("Error creating student:", error);
    return { success: false, error: true };
  }
}

export async function updateStudent(prevState: any, formData: StudentSchema) {
  try {
    // Convert sectionId to null if it's an empty string
    const sectionId = formData.sectionId ? Number(formData.sectionId) : null;

    const data: any = {
      username: formData.username,
      name: formData.name,
      surname: formData.surname,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address,
      bloodType: formData.bloodType,
      birthday: formData.birthday,
      sex: formData.sex,
      gradeId: Number(formData.gradeId),
      classId: Number(formData.classId),
      parentId: formData.parentId,
      sectionId: sectionId,
      status: formData.status || "ACTIVE", // Include status field
    };

    // Only update password if provided
    if (formData.password) {
      data.passwordHash = await bcrypt.hash(formData.password, 10);
    }

    // Update image if provided
    if (formData.img) {
      data.img = formData.img;
    }

    await prisma.student.update({
      where: { id: formData.id },
      data,
    });
    
    return { success: true, error: false };
  } catch (error) {
    console.error("Error updating student:", error);
    return { success: false, error: true };
  }
}

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// EXAM ACTIONS
export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        totalMarks: data.totalMarks || 100,
        passingMarks: data.passingMarks || 35,
        hasGrading: data.hasGrading || false,
        lesson: { connect: { id: data.lessonId } },
        ...(data.examTypeId && { examType: { connect: { id: data.examTypeId } } }),
        ...(data.termId && { term: { connect: { id: data.termId } } }),
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        totalMarks: data.totalMarks || 100,
        passingMarks: data.passingMarks || 35,
        hasGrading: data.hasGrading || false,
        lesson: { connect: { id: data.lessonId } },
        ...(data.examTypeId ? 
          { examType: { connect: { id: data.examTypeId } } } : 
          { examType: { disconnect: true } }),
        ...(data.termId ? 
          { term: { connect: { id: data.termId } } } : 
          { term: { disconnect: true } }),
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ADMIN ACTIONS
export const createAdmin = async (
  currentState: CurrentState,
  data: AdminSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"admin"}
    });

    await prisma.admin.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        img: data.img || null,
        status: data.status || "ACTIVE",
      },
    });

    revalidatePath("/list/admins");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAdmin = async (
  currentState: CurrentState,
  data: AdminSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.admin.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        img: data.img || null,
        status: data.status || "ACTIVE",
      },
    });
    revalidatePath("/list/admins");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAdmin = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.admin.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/admins");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// PARENT ACTIONS
export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"parent"}
    });

    await prisma.parent.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        status: data.status || "ACTIVE",
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
        status: data.status || "ACTIVE",
      },
    });
    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.parent.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ACADEMIC YEAR ACTIONS
export const createAcademicYear = async (
  currentState: CurrentState,
  data: AcademicYearSchema
) => {
  try {
    await prisma.academicYear.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent || false,
      },
    });

    // If this is set as current year, update other years
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: {
          id: {
            not: data.id,
          },
        },
        data: {
          isCurrent: false,
        },
      });
    }

    revalidatePath("/list/academic-years");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAcademicYear = async (
  currentState: CurrentState,
  data: AcademicYearSchema
) => {
  try {
    await prisma.academicYear.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent || false,
      },
    });

    // If this is set as current year, update other years
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: {
          id: {
            not: data.id,
          },
        },
        data: {
          isCurrent: false,
        },
      });
    }

    revalidatePath("/list/academic-years");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAcademicYear = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    // Check if there are any terms associated with this academic year
    const associatedTerms = await prisma.term.findMany({
      where: { academicYearId: Number(id) },
    });

    if (associatedTerms.length > 0) {
      return { 
        success: false, 
        error: true, 
        message: "Cannot delete academic year with associated terms" 
      };
    }
    
    await prisma.academicYear.delete({
      where: { id: Number(id) },
    });

    revalidatePath("/list/academic-years");
    return { success: true, error: false };
  } catch (error) {
    console.error(error);
    return { success: false, error: true };
  }
};

// TERM ACTIONS
export const createTerm = async (
  currentState: CurrentState,
  data: TermSchema
) => {
  try {
    await prisma.term.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        academicYearId: data.academicYearId,
      },
    });

    // revalidatePath("/list/terms");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTerm = async (
  currentState: CurrentState,
  data: TermSchema
) => {
  try {
    await prisma.term.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        academicYearId: data.academicYearId,
      },
    });

    revalidatePath("/list/terms");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTerm = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    // Check if there are any exams or report cards associated with this term
    const associatedExams = await prisma.exam.findMany({
      where: { termId: Number(id) },
    });

    const associatedReportCards = await prisma.reportCard.findMany({
      where: { termId: Number(id) },
    });

    if (associatedExams.length > 0 || associatedReportCards.length > 0) {
      return { 
        success: false, 
        error: true, 
        message: "Cannot delete term with associated exams or report cards" 
      };
    }
    
    await prisma.term.delete({
      where: { id: Number(id) },
    });

    revalidatePath("/list/terms");
    return { success: true, error: false };
  } catch (error) {
    console.error(error);
    return { success: false, error: true };
  }
};

// DEPARTMENT ACTIONS
export const createDepartment = async (
  currentState: CurrentState,
  data: DepartmentSchema
) => {
  try {
    await prisma.department.create({
      data: {
        name: data.name,
      },
    });

    revalidatePath("/list/departments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateDepartment = async (
  currentState: CurrentState,
  data: DepartmentSchema
) => {
  try {
    await prisma.department.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
      },
    });

    revalidatePath("/list/departments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteDepartment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.department.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/departments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// GRADE ACTIONS
export const createGrade = async (
  currentState: CurrentState,
  data: GradeSchema
) => {
  try {
    await prisma.grade.create({
      data: {
        level: data.level,
      },
    });

    revalidatePath("/list/grades");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateGrade = async (
  currentState: CurrentState,
  data: GradeSchema
) => {
  try {
    await prisma.grade.update({
      where: {
        id: data.id,
      },
      data: {
        level: data.level,
      },
    });

    revalidatePath("/list/grades");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteGrade = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.grade.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/grades");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// SECTION ACTIONS
export const createSection = async (
  currentState: CurrentState,
  data: SectionSchema
) => {
  try {
    await prisma.section.create({
      data: {
        name: data.name,
        classId: data.classId,
      },
    });

    revalidatePath("/list/sections");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSection = async (
  currentState: CurrentState,
  data: SectionSchema
) => {
  try {
    await prisma.section.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        classId: data.classId,
      },
    });

    revalidatePath("/list/sections");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSection = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.section.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/sections");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// SYLLABUS ACTIONS
export const createSyllabus = async (
  currentState: CurrentState,
  data: SyllabusSchema
) => {
  try {
    await prisma.syllabus.create({
      data: {
        content: data.content,
        subjectId: data.subjectId,
        description: data.description || null,
        completion: data.completion || 0,
      },
    });

    revalidatePath("/list/syllabi");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSyllabus = async (
  currentState: CurrentState,
  data: SyllabusSchema
) => {
  try {
    await prisma.syllabus.update({
      where: {
        id: data.id,
      },
      data: {
        content: data.content,
        subjectId: data.subjectId,
        description: data.description || null,
        completion: data.completion || 0,
      },
    });

    revalidatePath("/list/syllabi");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSyllabus = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.syllabus.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/syllabi");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// CURRICULUM ACTIONS
export const createCurriculum = async (
  currentState: CurrentState,
  data: CurriculumSchema
) => {
  try {
    await prisma.curriculum.create({
      data: {
        name: data.name,
        description: data.description || null,
        gradeId: data.gradeId,
        academicYearId: data.academicYearId,
        subjects: {
          connect: data.subjects.map(id => ({ id }))
        }
      },
    });

    revalidatePath("/list/curricula");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateCurriculum = async (
  currentState: CurrentState,
  data: CurriculumSchema
) => {
  try {
    await prisma.curriculum.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description || null,
        gradeId: data.gradeId,
        academicYearId: data.academicYearId,
        subjects: {
          set: data.subjects.map(id => ({ id }))
        }
      },
    });

    revalidatePath("/list/curricula");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteCurriculum = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.curriculum.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/curricula");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// LESSON ACTIONS
export const createLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subject: { connect: { id: data.subjectId } },
        class: { connect: { id: data.classId } },
        teacher: { connect: { id: data.teacherId } },
        ...(data.roomId && { room: { connect: { id: data.roomId } } }),
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        subject: { connect: { id: data.subjectId } },
        class: { connect: { id: data.classId } },
        teacher: { connect: { id: data.teacherId } },
        ...(data.roomId ? 
          { room: { connect: { id: data.roomId } } } : 
          { room: { disconnect: true } }),
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// EXAM TYPE ACTIONS
export const createExamType = async (
  currentState: CurrentState,
  data: ExamTypeSchema
) => {
  try {
    await prisma.examType.create({
      data: {
        name: data.name,
        total: data.total,
        hasPractical: data.hasPractical || false,
      },
    });

    revalidatePath("/list/exam-types");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExamType = async (
  currentState: CurrentState,
  data: ExamTypeSchema
) => {
  try {
    await prisma.examType.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        total: data.total,
        hasPractical: data.hasPractical || false,
      },
    });

    revalidatePath("/list/exam-types");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExamType = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.examType.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/exam-types");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ASSIGNMENT ACTIONS
export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        totalMarks: data.totalMarks || 50,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        totalMarks: data.totalMarks || 50,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// RESULT ACTIONS
export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.create({
      data: {
        score: data.score,
        practicalScore: data.practicalScore || null,
        totalObtained: data.totalObtained || 0,
        grade: data.grade || null,
        isPassed: data.isPassed || false,
        feedbackComments: data.feedbackComments || null,
        student: { connect: { id: data.studentId } },
        ...(data.examId && { exam: { connect: { id: data.examId } } }),
        ...(data.assignmentId && { assignment: { connect: { id: data.assignmentId } } }),
        ...(data.reportCardId && { reportCard: { connect: { id: data.reportCardId } } }),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        practicalScore: data.practicalScore || null,
        totalObtained: data.totalObtained || 0,
        grade: data.grade || null,
        isPassed: data.isPassed || false,
        feedbackComments: data.feedbackComments || null,
        student: { connect: { id: data.studentId } },
        ...(data.examId ? 
          { exam: { connect: { id: data.examId } } } : 
          { exam: { disconnect: true } }),
        ...(data.assignmentId ? 
          { assignment: { connect: { id: data.assignmentId } } } : 
          { assignment: { disconnect: true } }),
        ...(data.reportCardId ? 
          { reportCard: { connect: { id: data.reportCardId } } } : 
          { reportCard: { disconnect: true } }),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// REPORT CARD ACTIONS
export const createReportCard = async (
  currentState: CurrentState,
  data: ReportCardSchema
) => {
  try {
    await prisma.reportCard.create({
      data: {
        totalMarks: data.totalMarks,
        percentage: data.percentage,
        grade: data.grade,
        remarks: data.remarks || null,
        issueDate: data.issueDate,
        studentId: data.studentId,
        termId: data.termId,
      },
    });

    revalidatePath("/list/report-cards");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateReportCard = async (
  currentState: CurrentState,
  data: ReportCardSchema
) => {
  try {
    await prisma.reportCard.update({
      where: {
        id: data.id,
      },
      data: {
        totalMarks: data.totalMarks,
        percentage: data.percentage,
        grade: data.grade,
        remarks: data.remarks || null,
        issueDate: data.issueDate,
        studentId: data.studentId,
        termId: data.termId,
      },
    });

    revalidatePath("/list/report-cards");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteReportCard = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.reportCard.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/report-cards");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ATTENDANCE ACTIONS
export const createAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    await prisma.attendance.create({
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAttendance = async (
  currentState: CurrentState,
  data: AttendanceSchema
) => {
  try {
    await prisma.attendance.update({
      where: {
        id: data.id,
      },
      data: {
        date: data.date,
        present: data.present,
        studentId: data.studentId,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.attendance.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/attendance");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// EVENT ACTIONS
export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.classId && { class: { connect: { id: data.classId } } }),
        ...(data.roomId && { room: { connect: { id: data.roomId } } }),
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        ...(data.classId ? 
          { class: { connect: { id: data.classId } } } : 
          { class: { disconnect: true } }),
        ...(data.roomId ? 
          { room: { connect: { id: data.roomId } } } : 
          { room: { disconnect: true } }),
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ANNOUNCEMENT ACTIONS
export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        ...(data.classId && { class: { connect: { id: data.classId } } }),
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        ...(data.classId ? 
          { class: { connect: { id: data.classId } } } : 
          { class: { disconnect: true } }),
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// FEE STRUCTURE ACTIONS
export const createFeeStructure = async (
  currentState: CurrentState,
  data: FeeStructureSchema
) => {
  try {
    await prisma.feeStructure.create({
      data: {
        name: data.name,
        amount: data.amount,
        description: data.description || null,
        dueDate: data.dueDate || null,
        feeType: data.feeType,
        academicYear: data.academicYear || null,
        ...(data.gradeId && { grade: { connect: { id: data.gradeId } } }),
      },
    });

    revalidatePath("/list/fee-structures");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateFeeStructure = async (
  currentState: CurrentState,
  data: FeeStructureSchema
) => {
  try {
    await prisma.feeStructure.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        amount: data.amount,
        description: data.description || null,
        dueDate: data.dueDate || null,
        feeType: data.feeType,
        academicYear: data.academicYear || null,
        ...(data.gradeId ? 
          { grade: { connect: { id: data.gradeId } } } : 
          { grade: { disconnect: true } }),
      },
    });

    revalidatePath("/list/fee-structures");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteFeeStructure = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.feeStructure.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/fee-structures");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// FEE PAYMENT ACTIONS
export const createFeePayment = async (
  currentState: CurrentState,
  data: FeePaymentSchema
) => {
  try {
    await prisma.feePayment.create({
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || null,
        status: data.status,
        studentId: data.studentId,
        feeStructureId: data.feeStructureId,
        receiptNumber: data.receiptNumber || null,
      },
    });

    revalidatePath("/list/fee-payments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateFeePayment = async (
  currentState: CurrentState,
  data: FeePaymentSchema
) => {
  try {
    await prisma.feePayment.update({
      where: {
        id: data.id,
      },
      data: {
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || null,
        status: data.status,
        studentId: data.studentId,
        feeStructureId: data.feeStructureId,
        receiptNumber: data.receiptNumber || null,
      },
    });

    revalidatePath("/list/fee-payments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteFeePayment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.feePayment.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/fee-payments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// SCHOLARSHIP ACTIONS
export const createScholarship = async (
  currentState: CurrentState,
  data: ScholarshipSchema
) => {
  try {
    await prisma.scholarship.create({
      data: {
        name: data.name,
        amount: data.amount,
        percentage: data.percentage || null,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        studentId: data.studentId,
      },
    });

    revalidatePath("/list/scholarships");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateScholarship = async (
  currentState: CurrentState,
  data: ScholarshipSchema
) => {
  try {
    await prisma.scholarship.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        amount: data.amount,
        percentage: data.percentage || null,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        studentId: data.studentId,
      },
    });

    revalidatePath("/list/scholarships");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteScholarship = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.scholarship.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/scholarships");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// PAYROLL ACTIONS
export const createPayroll = async (
  currentState: CurrentState,
  data: PayrollSchema
) => {
  try {
    await prisma.payroll.create({
      data: {
        amount: data.amount,
        payDate: data.payDate,
        teacherId: data.teacherId,
        month: data.month,
        year: data.year,
        taxAmount: data.taxAmount || null,
        netSalary: data.netSalary,
        bonusAmount: data.bonusAmount || null,
      },
    });

    revalidatePath("/list/payrolls");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updatePayroll = async (
  currentState: CurrentState,
  data: PayrollSchema
) => {
  try {
    await prisma.payroll.update({
      where: {
        id: data.id,
      },
      data: {
        amount: data.amount,
        payDate: data.payDate,
        teacherId: data.teacherId,
        month: data.month,
        year: data.year,
        taxAmount: data.taxAmount || null,
        netSalary: data.netSalary,
        bonusAmount: data.bonusAmount || null,
      },
    });

    revalidatePath("/list/payrolls");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deletePayroll = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.payroll.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/payrolls");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// ROOM ACTIONS
export const createRoom = async (
  currentState: CurrentState,
  data: RoomSchema
) => {
  try {
    await prisma.room.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        type: data.type,
        location: data.location || null,
        available: data.available,
      },
    });

    revalidatePath("/list/rooms");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateRoom = async (
  currentState: CurrentState,
  data: RoomSchema
) => {
  try {
    await prisma.room.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        capacity: data.capacity,
        type: data.type,
        location: data.location || null,
        available: data.available,
      },
    });

    revalidatePath("/list/rooms");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteRoom = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.room.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/rooms");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// MESSAGE ACTIONS
export const createMessage = async (
  currentState: CurrentState,
  data: MessageSchema
) => {
  try {
    await prisma.message.create({
      data: {
        subject: data.subject,
        content: data.content,
        sendDate: data.sendDate,
        isRead: data.isRead,
        ...(data.studentSenderId && { studentSender: { connect: { id: data.studentSenderId } } }),
        ...(data.teacherSenderId && { teacherSender: { connect: { id: data.teacherSenderId } } }),
        ...(data.parentSenderId && { parentSender: { connect: { id: data.parentSenderId } } }),
        ...(data.studentReceiverId && { studentReceiver: { connect: { id: data.studentReceiverId } } }),
        ...(data.teacherReceiverId && { teacherReceiver: { connect: { id: data.teacherReceiverId } } }),
        ...(data.parentReceiverId && { parentReceiver: { connect: { id: data.parentReceiverId } } }),
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateMessage = async (
  currentState: CurrentState,
  data: MessageSchema
) => {
  try {
    await prisma.message.update({
      where: {
        id: data.id,
      },
      data: {
        subject: data.subject,
        content: data.content,
        sendDate: data.sendDate,
        isRead: data.isRead,
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteMessage = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.message.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// NOTIFICATION ACTIONS
export const createNotification = async (
  currentState: CurrentState,
  data: NotificationSchema
) => {
  try {
    await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        date: data.date,
        isRead: data.isRead,
        type: data.type,
        userId: data.userId,
        userType: data.userType,
      },
    });

    revalidatePath("/list/notifications");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateNotification = async (
  currentState: CurrentState,
  data: NotificationSchema
) => {
  try {
    await prisma.notification.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        message: data.message,
        date: data.date,
        isRead: data.isRead,
        type: data.type,
        userId: data.userId,
        userType: data.userType,
      },
    });

    revalidatePath("/list/notifications");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const markNotificationAsRead = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.notification.update({
      where: {
        id: parseInt(id),
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath("/list/notifications");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteNotification = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.notification.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/notifications");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// PARENT MEETING ACTIONS
export const createParentMeeting = async (
  currentState: CurrentState,
  data: ParentMeetingSchema
) => {
  try {
    await prisma.parentMeeting.create({
      data: {
        title: data.title,
        description: data.description || null,
        meetingDate: data.meetingDate,
        status: data.status,
        parentId: data.parentId,
        teacherId: data.teacherId,
        feedback: data.feedback || null,
      },
    });

    revalidatePath("/list/parent-meetings");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateParentMeeting = async (
  currentState: CurrentState,
  data: ParentMeetingSchema
) => {
  try {
    await prisma.parentMeeting.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description || null,
        meetingDate: data.meetingDate,
        status: data.status,
        parentId: data.parentId,
        teacherId: data.teacherId,
        feedback: data.feedback || null,
      },
    });

    revalidatePath("/list/parent-meetings");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteParentMeeting = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.parentMeeting.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/parent-meetings");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// DOCUMENT ACTIONS
export const createDocument = async (
  currentState: CurrentState,
  data: DocumentSchema
) => {
  try {
    await prisma.document.create({
      data: {
        title: data.title,
        fileUrl: data.fileUrl,
        uploadDate: data.uploadDate,
        type: data.type,
        description: data.description || null,
        ...(data.studentId && { student: { connect: { id: data.studentId } } }),
        ...(data.teacherId && { teacher: { connect: { id: data.teacherId } } }),
        ...(data.parentId && { parent: { connect: { id: data.parentId } } }),
        ...(data.adminId && { admin: { connect: { id: data.adminId } } }),
      },
    });

    revalidatePath("/list/documents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateDocument = async (
  currentState: CurrentState,
  data: DocumentSchema
) => {
  try {
    await prisma.document.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        fileUrl: data.fileUrl,
        uploadDate: data.uploadDate,
        type: data.type,
        description: data.description || null,
        ...(data.studentId ? 
          { student: { connect: { id: data.studentId } } } : 
          { student: { disconnect: true } }),
        ...(data.teacherId ? 
          { teacher: { connect: { id: data.teacherId } } } : 
          { teacher: { disconnect: true } }),
        ...(data.parentId ? 
          { parent: { connect: { id: data.parentId } } } : 
          { parent: { disconnect: true } }),
        ...(data.adminId ? 
          { admin: { connect: { id: data.adminId } } } : 
          { admin: { disconnect: true } }),
      },
    });

    revalidatePath("/list/documents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteDocument = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.document.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/documents");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// EXPENSE ACTIONS
export const createExpense = async (
  currentState: CurrentState,
  data: ExpenseSchema
) => {
  try {
    await prisma.expense.create({
      data: {
        title: data.title,
        amount: data.amount,
        date: data.date,
        category: data.category,
        description: data.description || null,
        receipt: data.receipt || null,
        approvedBy: data.approvedBy || null,
      },
    });

    revalidatePath("/list/expenses");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExpense = async (
  currentState: CurrentState,
  data: ExpenseSchema
) => {
  try {
    await prisma.expense.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        amount: data.amount,
        date: data.date,
        category: data.category,
        description: data.description || null,
        receipt: data.receipt || null,
        approvedBy: data.approvedBy || null,
      },
    });

    revalidatePath("/list/expenses");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExpense = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.expense.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/expenses");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// BUDGET ACTIONS
export const createBudget = async (
  currentState: CurrentState,
  data: BudgetSchema
) => {
  try {
    await prisma.budget.create({
      data: {
        title: data.title,
        totalAmount: data.totalAmount,
        allocatedDate: data.allocatedDate,
        endDate: data.endDate || null,
        description: data.description || null,
        category: data.category,
        utilizedAmount: data.utilizedAmount || 0,
      },
    });

    revalidatePath("/list/budgets");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateBudget = async (
  currentState: CurrentState,
  data: BudgetSchema
) => {
  try {
    await prisma.budget.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        totalAmount: data.totalAmount,
        allocatedDate: data.allocatedDate,
        endDate: data.endDate || null,
        description: data.description || null,
        category: data.category,
        utilizedAmount: data.utilizedAmount || 0,
      },
    });

    revalidatePath("/list/budgets");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteBudget = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.budget.delete({
      where: {
        id: parseInt(id),
      },
    });

    revalidatePath("/list/budgets");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
