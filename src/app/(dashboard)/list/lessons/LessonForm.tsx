"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { LessonSchema, lessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";
import { Day } from "@prisma/client";

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    subjects?: any[];
    classes?: any[];
    teachers?: any[];
    rooms?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      day: data?.day || "MONDAY",
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      subjectId: data?.subjectId || undefined,
      classId: data?.classId || undefined,
      teacherId: data?.teacherId || "",
      roomId: data?.roomId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createLesson : updateLesson,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    // Convert the ISO string dates to actual Date objects
    const processedData = {
      ...formData,
      startTime: new Date(formData.startTime!),
      endTime: new Date(formData.endTime!),
    };
    
    console.log("Submitting lesson:", processedData);
    formAction(processedData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const dayOptions = [
    { value: "MONDAY", label: "Monday" },
    { value: "TUESDAY", label: "Tuesday" },
    { value: "WEDNESDAY", label: "Wednesday" },
    { value: "THURSDAY", label: "Thursday" },
    { value: "FRIDAY", label: "Friday" },
  ];

  // Format datetime for input fields
  const formatDateTimeForInput = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new lesson" : "Update the lesson"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Lesson Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        
        <SelectField
          label="Day"
          name="day"
          defaultValue={data?.day}
          register={register}
          error={errors?.day}
          options={dayOptions}
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
          label="Subject"
          name="subjectId"
          defaultValue={data?.subjectId?.toString()}
          register={register}
          error={errors?.subjectId}
          options={
            relatedData.subjects?.map(subject => ({
              value: subject.id.toString(),
              label: subject.name
            })) || []
          }
        />
        
        <SelectField
          label="Class"
          name="classId"
          defaultValue={data?.classId?.toString()}
          register={register}
          error={errors?.classId}
          options={
            relatedData.classes?.map(cls => ({
              value: cls.id.toString(),
              label: cls.name
            })) || []
          }
        />
        
        <SelectField
          label="Teacher"
          name="teacherId"
          defaultValue={data?.teacherId}
          register={register}
          error={errors?.teacherId}
          options={
            relatedData.teachers?.map(teacher => ({
              value: teacher.id,
              label: `${teacher.name} ${teacher.surname}`
            })) || []
          }
        />
        
        <SelectField
          label="Room (Optional)"
          name="roomId"
          defaultValue={data?.roomId?.toString()}
          register={register}
          error={errors?.roomId}
          options={[
            { value: "", label: "No Room" },
            ...(relatedData.rooms?.map(room => ({
              value: room.id.toString(),
              label: room.name
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

export default LessonForm;
