"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { ParentMeetingSchema, parentMeetingSchema } from "@/lib/formValidationSchemas";
import { createParentMeeting, updateParentMeeting } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";
import DateTimeField from "@/components/DateTimeField";

const ParentMeetingForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    parents?: any[];
    teachers?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ParentMeetingSchema>({
    resolver: zodResolver(parentMeetingSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      meetingDate: data?.meetingDate ? new Date(data.meetingDate) : new Date(),
      status: data?.status || "Scheduled",
      parentId: data?.parentId || "",
      teacherId: data?.teacherId || "",
      feedback: data?.feedback || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createParentMeeting : updateParentMeeting,
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
      toast(`Parent meeting has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const statusOptions = [
    { value: "Scheduled", label: "Scheduled" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Schedule a new parent meeting" : "Update parent meeting"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />
        
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
          textarea
        />
        
        <DateTimeField
          label="Meeting Date and Time"
          name="meetingDate"
          defaultValue={data?.meetingDate}
          register={register}
          setValue={setValue}
          error={errors?.meetingDate}
        />
        
        <SelectField
          label="Status"
          name="status"
          defaultValue={data?.status}
          register={register}
          error={errors?.status}
          options={statusOptions}
        />
        
        <SelectField
          label="Parent"
          name="parentId"
          defaultValue={data?.parentId}
          register={register}
          error={errors?.parentId}
          options={
            relatedData.parents?.map(parent => ({
              value: parent.id,
              label: `${parent.surname}, ${parent.name}`
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
              label: `${teacher.surname}, ${teacher.name}`
            })) || []
          }
        />
        
        {(type === "update" || watch("status") === "Completed") && (
          <InputField
            label="Feedback"
            name="feedback"
            defaultValue={data?.feedback}
            register={register}
            error={errors?.feedback}
            textarea
          />
        )}
        
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
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
        {type === "create" ? "Schedule Meeting" : "Update Meeting"}
      </button>
    </form>
  );
};

export default ParentMeetingForm;
