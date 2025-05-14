"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { z } from "zod";
import { createDepartment, updateDepartment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// Define the schema for department validation
export const departmentSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Department name is required"),
});

export type DepartmentSchema = z.infer<typeof departmentSchema>;

const DepartmentForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepartmentSchema>({
    resolver: zodResolver(departmentSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createDepartment : updateDepartment,
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
      toast(`Department has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new department" : "Update the department"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Department Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        
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

export default DepartmentForm;
