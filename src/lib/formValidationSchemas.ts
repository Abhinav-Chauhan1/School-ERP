import { z } from "zod";

// Update existing schemas
export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
  departmentId: z.coerce.number().optional(),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  supervisorId: z.coerce.string().optional(),
  academicYearId: z.coerce.number().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
  departmentId: z.coerce.number().optional(),
  academicYearId: z.coerce.number().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]).default("ACTIVE"),
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
  sectionId: z.coerce.number().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]).default("ACTIVE"),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
  totalMarks: z.coerce.number().default(100),
  passingMarks: z.coerce.number().default(35),
  hasGrading: z.boolean().default(false),
  examTypeId: z.coerce.number().optional(),
  termId: z.coerce.number().optional(),
});

export type ExamSchema = z.infer<typeof examSchema>;

// Add new schemas
export const adminSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  img: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]).default("ACTIVE"),
});

export type AdminSchema = z.infer<typeof adminSchema>;

export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  status: z.enum(["ACTIVE", "SUSPENDED", "ARCHIVED"]).default("ACTIVE"),
});

export type ParentSchema = z.infer<typeof parentSchema>;

export const academicYearSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  endDate: z.coerce.date({ message: "End date is required!" }),
  isCurrent: z.boolean().default(false),
});

export type AcademicYearSchema = z.infer<typeof academicYearSchema>;

export const termSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  endDate: z.coerce.date({ message: "End date is required!" }),
  academicYearId: z.coerce.number({ message: "Academic year is required!" }),
});

export type TermSchema = z.infer<typeof termSchema>;

export const departmentSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Department name is required!" }),
});

export type DepartmentSchema = z.infer<typeof departmentSchema>;

export const gradeSchema = z.object({
  id: z.coerce.number().optional(),
  level: z.coerce.number().min(1, { message: "Grade level is required!" }),
});

export type GradeSchema = z.infer<typeof gradeSchema>;

export const sectionSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Section name is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
});

export type SectionSchema = z.infer<typeof sectionSchema>;

export const syllabusSchema = z.object({
  id: z.coerce.number().optional(),
  content: z.string().min(1, { message: "Content is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  description: z.string().optional(),
  completion: z.coerce.number().default(0),
});

export type SyllabusSchema = z.infer<typeof syllabusSchema>;

export const curriculumSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  description: z.string().optional(),
  gradeId: z.coerce.number({ message: "Grade is required!" }),
  academicYearId: z.coerce.number({ message: "Academic year is required!" }),
  subjects: z.array(z.coerce.number()), // subject ids
});

export type CurriculumSchema = z.infer<typeof curriculumSchema>;

export const lessonSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  subjectId: z.coerce.number({ message: "Subject is required!" }),
  classId: z.coerce.number({ message: "Class is required!" }),
  teacherId: z.string({ message: "Teacher is required!" }),
  roomId: z.coerce.number().optional(),
});

export type LessonSchema = z.infer<typeof lessonSchema>;

export const examTypeSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  total: z.coerce.number().min(1, { message: "Total marks are required!" }),
  hasPractical: z.boolean().default(false),
});

export type ExamTypeSchema = z.infer<typeof examTypeSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  startDate: z.coerce.date({ message: "Start date is required!" }),
  dueDate: z.coerce.date({ message: "Due date is required!" }),
  totalMarks: z.coerce.number().default(50),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number(),
  practicalScore: z.coerce.number().optional(),
  totalObtained: z.coerce.number().default(0),
  grade: z.string().optional(),
  isPassed: z.boolean().default(false),
  feedbackComments: z.string().optional(),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
  studentId: z.string({ message: "Student is required!" }),
  reportCardId: z.coerce.number().optional(),
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const reportCardSchema = z.object({
  id: z.coerce.number().optional(),
  totalMarks: z.coerce.number(),
  percentage: z.coerce.number(),
  grade: z.string(),
  remarks: z.string().optional(),
  issueDate: z.coerce.date(),
  studentId: z.string({ message: "Student is required!" }),
  termId: z.coerce.number({ message: "Term is required!" }),
});

export type ReportCardSchema = z.infer<typeof reportCardSchema>;

export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  date: z.coerce.date(),
  present: z.boolean(),
  studentId: z.string({ message: "Student is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  classId: z.coerce.number().optional(),
  roomId: z.coerce.number().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string(),
  date: z.coerce.date(),
  classId: z.coerce.number().optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const feeStructureSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  amount: z.coerce.number().min(0),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  feeType: z.string(),
  academicYear: z.string().optional(),
  gradeId: z.coerce.number().optional(),
});

export type FeeStructureSchema = z.infer<typeof feeStructureSchema>;

export const feePaymentSchema = z.object({
  id: z.coerce.number().optional(),
  amount: z.coerce.number().min(0),
  paymentDate: z.coerce.date().default(new Date()),
  paymentMethod: z.string(),
  transactionId: z.string().optional(),
  status: z.string(),
  studentId: z.string({ message: "Student is required!" }),
  feeStructureId: z.coerce.number({ message: "Fee structure is required!" }),
  receiptNumber: z.string().optional(),
});

export type FeePaymentSchema = z.infer<typeof feePaymentSchema>;

export const scholarshipSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  amount: z.coerce.number().min(0),
  percentage: z.coerce.number().optional(),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  studentId: z.string({ message: "Student is required!" }),
});

export type ScholarshipSchema = z.infer<typeof scholarshipSchema>;

export const payrollSchema = z.object({
  id: z.coerce.number().optional(),
  amount: z.coerce.number().min(0),
  payDate: z.coerce.date(),
  teacherId: z.string({ message: "Teacher is required!" }),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number(),
  taxAmount: z.coerce.number().optional(),
  netSalary: z.coerce.number(),
  bonusAmount: z.coerce.number().optional(),
});

export type PayrollSchema = z.infer<typeof payrollSchema>;

export const roomSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Name is required!" }),
  capacity: z.coerce.number().min(1),
  type: z.string(),
  location: z.string().optional(),
  available: z.boolean().default(true),
});

export type RoomSchema = z.infer<typeof roomSchema>;

export const messageSchema = z.object({
  id: z.coerce.number().optional(),
  subject: z.string().min(1, { message: "Subject is required!" }),
  content: z.string(),
  sendDate: z.coerce.date().default(new Date()),
  isRead: z.boolean().default(false),
  studentSenderId: z.string().optional(),
  teacherSenderId: z.string().optional(),
  parentSenderId: z.string().optional(),
  studentReceiverId: z.string().optional(),
  teacherReceiverId: z.string().optional(),
  parentReceiverId: z.string().optional(),
});

export type MessageSchema = z.infer<typeof messageSchema>;

export const notificationSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  message: z.string(),
  date: z.coerce.date().default(new Date()),
  isRead: z.boolean().default(false),
  type: z.string(),
  userId: z.string(),
  userType: z.string(),
});

export type NotificationSchema = z.infer<typeof notificationSchema>;

export const parentMeetingSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  description: z.string().optional(),
  meetingDate: z.coerce.date(),
  status: z.string(),
  parentId: z.string({ message: "Parent is required!" }),
  teacherId: z.string({ message: "Teacher is required!" }),
  feedback: z.string().optional(),
});

export type ParentMeetingSchema = z.infer<typeof parentMeetingSchema>;

export const documentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  fileUrl: z.string(),
  uploadDate: z.coerce.date().default(new Date()),
  type: z.string(),
  description: z.string().optional(),
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  parentId: z.string().optional(),
  adminId: z.string().optional(),
});

export type DocumentSchema = z.infer<typeof documentSchema>;

export const expenseSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  amount: z.coerce.number().min(0),
  date: z.coerce.date(),
  category: z.string(),
  description: z.string().optional(),
  receipt: z.string().optional(),
  approvedBy: z.string().optional(),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;

export const budgetSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required!" }),
  totalAmount: z.coerce.number().min(0),
  allocatedDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  description: z.string().optional(),
  category: z.string(),
  utilizedAmount: z.coerce.number().default(0),
});

export type BudgetSchema = z.infer<typeof budgetSchema>;
