"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { ResultSchema, resultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    students?: any[];
    exams?: any[];
    assignments?: any[];
    reportCards?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      id: data?.id,
      score: data?.score || 0,
      practicalScore: data?.practicalScore || 0,
      totalObtained: data?.totalObtained || 0,
      grade: data?.grade || "",
      isPassed: data?.isPassed || false,
      feedbackComments: data?.feedbackComments || "",
      examId: data?.examId || undefined,
      assignmentId: data?.assignmentId || undefined,
      studentId: data?.studentId || "",
      reportCardId: data?.reportCardId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  const [selectedType, setSelectedType] = useState<"exam" | "assignment">(
    data?.examId ? "exam" : "assignment"
  );

  // Watch for changes to calculate total
  const score = watch("score");
  const practicalScore = watch("practicalScore") || 0;
  const examId = watch("examId");
  const assignmentId = watch("assignmentId");

  // Find selected exam or assignment for passing calculation
  const selectedExam = examId ? relatedData.exams?.find(e => e.id.toString() === examId?.toString()) : null;
  const selectedAssignment = assignmentId ? relatedData.assignments?.find(a => a.id.toString() === assignmentId?.toString()) : null;

  // Calculate total and passing status
  useEffect(() => {
    const total = Number(score) + Number(practicalScore);
    setValue("totalObtained", total);

    if (selectedType === "exam" && selectedExam) {
      // Calculate if passed based on exam passing marks
      const isPassed = total >= selectedExam.passingMarks;
      setValue("isPassed", isPassed);
      
      // Calculate grade if exam has grading
      if (selectedExam.hasGrading) {
        const percentage = (total / selectedExam.totalMarks) * 100;
        let grade = "";
        
        if (percentage >= 90) grade = "A+";
        else if (percentage >= 80) grade = "A";
        else if (percentage >= 70) grade = "B";
        else if (percentage >= 60) grade = "C";
        else if (percentage >= 50) grade = "D";
        else grade = "F";
        
        setValue("grade", grade);
      }
    } else if (selectedType === "assignment" && selectedAssignment) {
      // For assignment, use 50% as default passing criteria if not specified
      const passingThreshold = selectedAssignment.totalMarks * 0.5;
      const isPassed = total >= passingThreshold;
      setValue("isPassed", isPassed);
    }
  }, [score, practicalScore, selectedExam, selectedAssignment, selectedType, setValue]);

  // Handle assessment type change
  const handleTypeChange = (type: "exam" | "assignment") => {
    setSelectedType(type);
    if (type === "exam") {
      setValue("assignmentId", undefined);
    } else {
      setValue("examId", undefined);
      setValue("practicalScore", 0);
    }
  };

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new result" : "Update the result"}
      </h1>

      <div className="flex flex-col gap-4">
        <SelectField
          label="Student"
          name="studentId"
          defaultValue={data?.studentId}
          register={register}
          error={errors?.studentId}
          options={
            relatedData.students?.map(student => ({
              value: student.id,
              label: `${student.name} ${student.surname}`
            })) || []
          }
        />
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            className={`p-2 rounded-md ${selectedType === 'exam' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleTypeChange('exam')}
          >
            Exam
          </button>
          <button 
            type="button"
            className={`p-2 rounded-md ${selectedType === 'assignment' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => handleTypeChange('assignment')}
          >
            Assignment
          </button>
        </div>
        
        {selectedType === "exam" && (
          <SelectField
            label="Exam"
            name="examId"
            defaultValue={data?.examId?.toString()}
            register={register}
            error={errors?.examId}
            options={
              relatedData.exams?.map(exam => ({
                value: exam.id.toString(),
                label: `${exam.title} (Total: ${exam.totalMarks})`
              })) || []
            }
          />
        )}
        
        {selectedType === "assignment" && (
          <SelectField
            label="Assignment"
            name="assignmentId"
            defaultValue={data?.assignmentId?.toString()}
            register={register}
            error={errors?.assignmentId}
            options={
              relatedData.assignments?.map(assignment => ({
                value: assignment.id.toString(),
                label: `${assignment.title} (Total: ${assignment.totalMarks})`
              })) || []
            }
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Score"
            name="score"
            type="number"
            defaultValue={data?.score || 0}
            register={register}
            error={errors?.score}
          />
          
          {selectedType === "exam" && selectedExam?.examType?.hasPractical && (
            <InputField
              label="Practical Score"
              name="practicalScore"
              type="number"
              defaultValue={data?.practicalScore || 0}
              register={register}
              error={errors?.practicalScore}
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Total Obtained"
            name="totalObtained"
            type="number"
            register={register}
            error={errors?.totalObtained}
            disabled
          />
          
          <div className="flex items-center gap-2 mt-8">
            <input
              type="checkbox"
              id="isPassed"
              className="w-4 h-4"
              {...register("isPassed")}
            />
            <label htmlFor="isPassed" className="text-sm font-medium">
              Passed
            </label>
          </div>
        </div>
        
        <InputField
          label="Grade"
          name="grade"
          defaultValue={data?.grade || ""}
          register={register}
          error={errors?.grade}
        />
        
        <InputField
          label="Feedback"
          name="feedbackComments"
          defaultValue={data?.feedbackComments || ""}
          register={register}
          error={errors?.feedbackComments}
          textarea
        />
        
        <SelectField
          label="Report Card (Optional)"
          name="reportCardId"
          defaultValue={data?.reportCardId?.toString()}
          register={register}
          error={errors?.reportCardId}
          options={[
            { value: "", label: "No Report Card" },
            ...(relatedData.reportCards?.map(rc => ({
              value: rc.id.toString(),
              label: `${rc.term.name} - ${rc.student.name} ${rc.student.surname}`
            })) || [])
          ]}
        />
        
        {data?.id && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>
      
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;
