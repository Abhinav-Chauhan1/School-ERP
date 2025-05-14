"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { z } from "zod";
import { createSection, updateSection } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Class } from "@prisma/client";

// Define the schema for section validation
export const sectionSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Section name is required"),
  classId: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ required_error: "Class is required" })
  ),
});

export type SectionSchema = z.infer<typeof sectionSchema>;

const SectionForm = ({
  type,
  data,
  classes,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  classes: Class[];
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SectionSchema>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      classId: data?.classId || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSection : updateSection,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Section has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new section" : "Update the section"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Section Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        
        <div className="flex flex-col">
          <label htmlFor="classId" className="text-sm mb-1">Class</label>
          <select
            id="classId"
            className={`p-2 border rounded-md ${errors.classId ? "border-red-500" : "border-gray-300"}`}
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">Select a class</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <span className="text-red-500 text-sm mt-1">{String(errors.classId.message)}</span>
          )}
        </div>
        
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

export default SectionForm;
