"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { ExamSchema, examSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    lessons?: any[];
    examTypes?: any[];
    terms?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      id: data?.id,
      title: data?.title || "",
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      lessonId: data?.lessonId || undefined,
      totalMarks: data?.totalMarks || 100,
      passingMarks: data?.passingMarks || 35,
      hasGrading: data?.hasGrading || false,
      examTypeId: data?.examTypeId || undefined,
      termId: data?.termId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Exam has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Format datetime for input fields
  const formatDateTimeForInput = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  const hasGrading = watch("hasGrading");

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Exam Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Start Time"
            name="startTime"
            type="datetime-local"
            defaultValue={formatDateTimeForInput(data?.startTime)}
            register={register}
            error={errors?.startTime}
          />
          
          <InputField
            label="End Time"
            name="endTime"
            type="datetime-local"
            defaultValue={formatDateTimeForInput(data?.endTime)}
            register={register}
            error={errors?.endTime}
          />
        </div>
        
        <SelectField
          label="Lesson"
          name="lessonId"
          defaultValue={data?.lessonId?.toString()}
          register={register}
          error={errors?.lessonId}
          options={
            relatedData.lessons?.map(lesson => ({
              value: lesson.id.toString(),
              label: `${lesson.name} (${lesson.subject?.name || 'No subject'} - ${lesson.class?.name || 'No class'})`
            })) || []
          }
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Total Marks"
            name="totalMarks"
            type="number"
            defaultValue={data?.totalMarks || 100}
            register={register}
            error={errors?.totalMarks}
          />
          
          <InputField
            label="Passing Marks"
            name="passingMarks"
            type="number"
            defaultValue={data?.passingMarks || 35}
            register={register}
            error={errors?.passingMarks}
          />
        </div>
        
        <div className="flex items-center gap-2 my-2">
          <input
            type="checkbox"
            id="hasGrading"
            className="w-4 h-4"
            {...register("hasGrading")}
            defaultChecked={data?.hasGrading || false}
          />
          <label htmlFor="hasGrading" className="text-sm font-medium">
            Use Letter Grading
          </label>
        </div>
        
        <SelectField
          label="Exam Type (Optional)"
          name="examTypeId"
          defaultValue={data?.examTypeId?.toString()}
          register={register}
          error={errors?.examTypeId}
          options={[
            { value: "", label: "Select Exam Type" },
            ...(relatedData.examTypes?.map(type => ({
              value: type.id.toString(),
              label: type.name
            })) || [])
          ]}
        />
        
        <SelectField
          label="Term (Optional)"
          name="termId"
          defaultValue={data?.termId?.toString()}
          register={register}
          error={errors?.termId}
          options={[
            { value: "", label: "Select Term" },
            ...(relatedData.terms?.map(term => ({
              value: term.id.toString(),
              label: term.name
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

export default ExamForm;
