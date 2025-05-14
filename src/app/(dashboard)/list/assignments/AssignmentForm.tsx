"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { AssignmentSchema, assignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const AssignmentForm = ({
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
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      id: data?.id,
      title: data?.title || "",
      startDate: data?.startDate ? new Date(data.startDate) : new Date(),
      dueDate: data?.dueDate ? new Date(data.dueDate) : undefined,
      totalMarks: data?.totalMarks || 50,
      lessonId: data?.lessonId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
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
      toast(`Assignment has been ${type === "create" ? "created" : "updated"}!`);
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
        {type === "create" ? "Create a new assignment" : "Update the assignment"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Assignment Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Start Date"
            name="startDate"
            type="datetime-local"
            defaultValue={formatDateTimeForInput(data?.startDate || new Date())}
            register={register}
            error={errors?.startDate}
          />
          
          <InputField
            label="Due Date"
            name="dueDate"
            type="datetime-local"
            defaultValue={formatDateTimeForInput(data?.dueDate)}
            register={register}
            error={errors?.dueDate}
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
        
        <InputField
          label="Total Marks"
          name="totalMarks"
          type="number"
          defaultValue={data?.totalMarks || 50}
          register={register}
          error={errors?.totalMarks}
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

export default AssignmentForm;
