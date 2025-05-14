"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { AnnouncementSchema, announcementSchema } from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const AnnouncementsForm = ({
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
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      id: data?.id,
      title: data?.title || "",
      description: data?.description || "",
      date: data?.date ? new Date(data.date) : new Date(),
      classId: data?.classId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
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
      toast(`Announcement has been ${type === "create" ? "created" : "updated"}!`);
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
        {type === "create" ? "Create a new announcement" : "Update the announcement"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Announcement Title"
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
          rows={4}
        />
        
        <InputField
          label="Date"
          name="date"
          type="datetime-local"
          defaultValue={formatDateTimeForInput(data?.date || new Date())}
          register={register}
          error={errors?.date}
        />
        
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

export default AnnouncementsForm;
