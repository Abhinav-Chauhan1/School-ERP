"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { ReportCardSchema, reportCardSchema } from "@/lib/formValidationSchemas";
import { createReportCard, updateReportCard } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const ReportCardForm = ({
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
    terms?: any[];
    results?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReportCardSchema>({
    resolver: zodResolver(reportCardSchema),
    defaultValues: {
      id: data?.id,
      totalMarks: data?.totalMarks || 0,
      percentage: data?.percentage || 0,
      grade: data?.grade || "",
      remarks: data?.remarks || "",
      issueDate: data?.issueDate ? new Date(data.issueDate) : new Date(),
      studentId: data?.studentId || "",
      termId: data?.termId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createReportCard : updateReportCard,
    {
      success: false,
      error: false,
    }
  );

  const totalMarks = watch("totalMarks");
  const percentage = watch("percentage");

  // Auto-calculate grade based on percentage
  useEffect(() => {
    const percentage = watch("percentage");
    let grade = "";
    
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";
    else grade = "F";
    
    setValue("grade", grade);
  }, [percentage, setValue, watch]);

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Report Card has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Format datetime for input fields
  const formatDateTimeForInput = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new report card" : "Update the report card"}
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
        
        <SelectField
          label="Term"
          name="termId"
          defaultValue={data?.termId?.toString()}
          register={register}
          error={errors?.termId}
          options={
            relatedData.terms?.map(term => ({
              value: term.id.toString(),
              label: `${term.name} (${term.academicYear.name})`
            })) || []
          }
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Total Marks"
            name="totalMarks"
            type="number"
            defaultValue={data?.totalMarks || 0}
            register={register}
            error={errors?.totalMarks}
          />
          
          <InputField
            label="Percentage"
            name="percentage"
            type="number"
            // step="0.01"
            defaultValue={data?.percentage || 0}
            register={register}
            error={errors?.percentage}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Grade"
            name="grade"
            defaultValue={data?.grade || ""}
            register={register}
            error={errors?.grade}
            disabled // Auto-calculated based on percentage
          />
          
          <InputField
            label="Issue Date"
            name="issueDate"
            type="datetime-local"
            defaultValue={formatDateTimeForInput(data?.issueDate || new Date())}
            register={register}
            error={errors?.issueDate}
          />
        </div>
        
        <InputField
          label="Remarks"
          name="remarks"
          defaultValue={data?.remarks || ""}
          register={register}
          error={errors?.remarks}
          textarea
          rows={3}
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

export default ReportCardForm;
