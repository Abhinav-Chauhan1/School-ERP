"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteAcademicYear,
  deleteTerm,
  deleteParent,
  deleteDepartment,
  deleteGrade,
  deleteSection,
  deleteCurriculum,
  deleteSyllabus,
  deleteLesson,
  deleteExamType,
  deleteAssignment,
  deleteResult,
  deleteReportCard,
  deleteAttendance,
  deleteEvent,
  deleteAnnouncement,
  deleteFeeStructure,
  deleteFeePayment,
  deletePayroll,
  deleteRoom,
  deleteParentMeeting,
  deleteExpense,
  deleteBudget, // Add import for deleteBudget action
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  academicYear: deleteAcademicYear,
  term: deleteTerm,
  parent: deleteParent,
  department: deleteDepartment,
  grade: deleteGrade,
  section: deleteSection,
  curriculum: deleteCurriculum,
  syllabus: deleteSyllabus,
  lesson: deleteLesson,
  examType: deleteExamType,
  assignment: deleteAssignment,
  result: deleteResult,
  reportCard: deleteReportCard,
  attendance: deleteAttendance,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  feeStructure: deleteFeeStructure,
  feePayment: deleteFeePayment,
  payroll: deletePayroll,
  room: deleteRoom,
  parentMeeting: deleteParentMeeting,
  expense: deleteExpense,
  budget: deleteBudget, // Add budget to delete action map
};

// USE LAZY LOADING

const TeacherForm = dynamic(() => import("@/app/(dashboard)/teacher/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("@/app/(dashboard)/student/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("@/app/(dashboard)/parent/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("@/app/(dashboard)/list/subjects/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("../app/(dashboard)/list/classes/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("@/app/(dashboard)/list/exams/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AcademicYearForm = dynamic(() => import("./forms/AcademicYearForm"), {
  loading: () => <h1>Loading...</h1>,
});
const TermForm = dynamic(() => import("./forms/TermForm"), {
  loading: () => <h1>Loading...</h1>,
});
const DepartmentForm = dynamic(() => import("@/app/(dashboard)/list/department/DeparmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const GradeForm = dynamic(() => import("@/app/(dashboard)/list/grade/GradeForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SectionForm = dynamic(() => import("@/app/(dashboard)/list/sections/SectionForm"), {
  loading: () => <h1>Loading...</h1>,
});
const CurriculumForm = dynamic(() => import("@/app/(dashboard)/list/curriculum/CurriculumForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SyllabusForm = dynamic(() => import("@/app/(dashboard)/list/syllabus/SyllabusForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("@/app/(dashboard)/list/lessons/LessonForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamTypeForm = dynamic(() => import("@/app/(dashboard)/list/exam-type/ExamTypeForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("@/app/(dashboard)/list/assignments/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("@/app/(dashboard)/list/results/ResultForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ReportCardForm = dynamic(() => import("@/app/(dashboard)/list/reportcard/ReportCardForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AttendanceForm = dynamic(() => import("@/app/(dashboard)/list/attendance/AttendanceForm"), {
  loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("@/app/(dashboard)/list/events/EventForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementsForm = dynamic(() => import("@/app/(dashboard)/list/announcements/AnnouncementsForm"), {
  loading: () => <h1>Loading...</h1>,
});
const FeeStructureForm = dynamic(() => import("@/app/(dashboard)/list/fee-structure/FeeStructureForm"), {
  loading: () => <h1>Loading...</h1>,
});
const FeePaymentForm = dynamic(() => import("@/app/(dashboard)/list/fee-payment/FeePaymentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const PayrollForm = dynamic(() => import("@/app/(dashboard)/list/payroll/PayRollForm"), {
  loading: () => <h1>Loading...</h1>,
});
const RoomForm = dynamic(() => import("@/app/(dashboard)/list/room/RoomForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentMeetingForm = dynamic(() => import("@/app/(dashboard)/list/parentmeeting/ParentMeetingForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExpenseForm = dynamic(() => import("@/app/(dashboard)/list/expense/ExpenseForm"), {
  loading: () => <h1>Loading...</h1>,
});
const BudgetForm = dynamic(() => import("@/app/(dashboard)/list/budget/BudgetForm"), {
  loading: () => <h1>Loading...</h1>,
});
// TODO: OTHER FORMS

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={{
        teachers: relatedData?.teachers || [],
        grades: relatedData?.grades || [],
        academicYears: relatedData?.academicYears || []
      }}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  academicYear: (setOpen, type, data) => (
    <AcademicYearForm
      type={type}
      data={data}
      setOpen={setOpen}
    />
  ),
  term: (setOpen, type, data, relatedData) => (
    <TermForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  department: (setOpen, type, data) => (
    <DepartmentForm
      type={type}
      data={data}
      setOpen={setOpen}
    />
  ),
  grade: (setOpen, type, data) => (
    <GradeForm
      type={type}
      data={data}
      setOpen={setOpen}
    />
  ),
  section: (setOpen, type, data, relatedData) => (
    <SectionForm
      type={type}
      data={data}
      setOpen={setOpen}
      classes={relatedData?.classes || []}
    />
  ),
  curriculum: (setOpen, type, data, relatedData) => (
    <CurriculumForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  syllabus: (setOpen, type, data, relatedData) => (
    <SyllabusForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  examType: (setOpen, type, data) => (
    <ExamTypeForm
      type={type}
      data={data}
      setOpen={setOpen}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  reportCard: (setOpen, type, data, relatedData) => (
    <ReportCardForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  attendance: (setOpen, type, data, relatedData) => (
    <AttendanceForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementsForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  feeStructure: (setOpen, type, data, relatedData) => (
    <FeeStructureForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  feePayment: (setOpen, type, data, relatedData) => (
    <FeePaymentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  payroll: (setOpen, type, data, relatedData) => (
    <PayrollForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  room: (setOpen, type, data, relatedData) => (
    <RoomForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parentMeeting: (setOpen, type, data, relatedData) => (
    <ParentMeetingForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  expense: (setOpen, type, data) => (
    <ExpenseForm
      type={type}
      data={data}
      setOpen={setOpen}
    />
  ),
  budget: (setOpen, type, data) => (
    <BudgetForm
      type={type}
      data={data}
      setOpen={setOpen}
    />
  ),
  // TODO OTHER LIST ITEMS
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction] = useFormState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);

    return type === "delete" && id ? (
      <form action={formAction} className="p-4 flex flex-col gap-4">
        <input type="text | number" name="id" value={id} hidden />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
