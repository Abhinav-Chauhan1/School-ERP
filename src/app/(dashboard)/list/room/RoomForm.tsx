"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { RoomSchema, roomSchema } from "@/lib/formValidationSchemas";
import { createRoom, updateRoom } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";
import SwitchField from "@/components/SwitchField";
import MultiSelectField from "@/components/MultiSelectField";

const RoomForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    classes?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RoomSchema>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: data?.name || "",
      capacity: data?.capacity || 30,
      type: data?.type || "Classroom",
      location: data?.location || "",
      available: data?.available ?? true,
      classes: data?.classes?.map((cls: any) => Number(cls.id)) || [],
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createRoom : updateRoom,
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
      toast(`Room has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const handleMultiSelectChange = (selectedOptions: string[]) => {
    setValue("classes", selectedOptions.map(id => Number(id)));
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new room" : "Update the room"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Room Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        
        <SelectField
          label="Room Type"
          name="type"
          defaultValue={data?.type}
          register={register}
          error={errors?.type}
          options={[
            { value: "Classroom", label: "Classroom" },
            { value: "Laboratory", label: "Laboratory" },
            { value: "Library", label: "Library" },
            { value: "Auditorium", label: "Auditorium" },
            { value: "Gym", label: "Gym" },
            { value: "Cafeteria", label: "Cafeteria" },
            { value: "Office", label: "Office" },
            { value: "Conference", label: "Conference Room" },
            { value: "Other", label: "Other" },
          ]}
        />
        
        <InputField
          label="Capacity"
          name="capacity"
          type="number"
          defaultValue={data?.capacity?.toString()}
          register={register}
          error={errors?.capacity}
        />
        
        <InputField
          label="Location"
          name="location"
          defaultValue={data?.location}
          register={register}
          error={errors?.location}
        />
        
        <SwitchField
          label="Available"
          name="available"
          defaultChecked={data?.available ?? true}
          register={register}
          setValue={setValue}
        />
        
        {relatedData?.classes && relatedData.classes.length > 0 && (
          <MultiSelectField
            label="Assign to Classes"
            options={
              relatedData.classes.map(cls => ({
                value: cls.id.toString(),
                label: cls.name
              }))
            }
            defaultValues={data?.classes?.map((c: any) => c.id.toString()) || []}
            onChange={handleMultiSelectChange}
            error={errors?.classes}
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
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default RoomForm;
