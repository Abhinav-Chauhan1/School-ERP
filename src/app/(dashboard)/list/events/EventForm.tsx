"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { EventSchema, eventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    classes?: any[];
    rooms?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      id: data?.id,
      title: data?.title || "",
      description: data?.description || "",
      startTime: data?.startTime ? new Date(data.startTime) : new Date(),
      endTime: data?.endTime ? new Date(data.endTime) : new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour later
      classId: data?.classId || undefined,
      roomId: data?.roomId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
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
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
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
        {type === "create" ? "Create a new event" : "Update the event"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Event Title"
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
          rows={3}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Class (Optional)"
            name="classId"
            defaultValue={data?.classId?.toString()}
            register={register}
            error={errors?.classId}
            options={[
              { value: "", label: "All Classes/School-wide" },
              ...(relatedData.classes?.map(c => ({
                value: c.id.toString(),
                label: c.name
              })) || [])
            ]}
          />
          
          <SelectField
            label="Room (Optional)"
            name="roomId"
            defaultValue={data?.roomId?.toString()}
            register={register}
            error={errors?.roomId}
            options={[
              { value: "", label: "No Specific Room" },
              ...(relatedData.rooms?.map(room => ({
                value: room.id.toString(),
                label: room.name
              })) || [])
            ]}
          />
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

export default EventForm;
