"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { AttendanceSchema, attendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const AttendanceForm = ({
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
    lessons?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      id: data?.id,
      date: data?.date ? new Date(data.date) : new Date(),
      present: data?.present ?? true,
      studentId: data?.studentId || "",
      lessonId: data?.lessonId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
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
      toast(`Attendance has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Format date for input fields
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new attendance record" : "Update the attendance record"}
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
          label="Lesson"
          name="lessonId"
          defaultValue={data?.lessonId?.toString()}
          register={register}
          error={errors?.lessonId}
          options={
            relatedData.lessons?.map(lesson => ({
              value: lesson.id.toString(),
              label: `${lesson.name} (${lesson.subject?.name || ''} - ${lesson.day})`
            })) || []
          }
        />
        
        <InputField
          label="Date"
          name="date"
          type="date"
          defaultValue={formatDateForInput(data?.date || new Date())}
          register={register}
          error={errors?.date}
        />
        
        <div className="flex items-center gap-2 my-2">
          <input
            type="checkbox"
            id="present"
            className="w-4 h-4"
            {...register("present")}
            defaultChecked={data?.present ?? true}
          />
          <label htmlFor="present" className="text-sm font-medium">
            Present
          </label>
        </div>
        
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

export default AttendanceForm;
