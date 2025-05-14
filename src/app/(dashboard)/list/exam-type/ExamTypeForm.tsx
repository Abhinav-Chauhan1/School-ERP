"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { ExamTypeSchema, examTypeSchema } from "@/lib/formValidationSchemas";
import { createExamType, updateExamType } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ExamTypeForm = ({
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
    watch,
  } = useForm<ExamTypeSchema>({
    resolver: zodResolver(examTypeSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      total: data?.total || 100,
      hasPractical: data?.hasPractical || false,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExamType : updateExamType,
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
      toast(`Exam Type has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam type" : "Update the exam type"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Exam Type Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        
        <InputField
          label="Total Marks"
          name="total"
          type="number"
          defaultValue={data?.total || 100}
          register={register}
          error={errors?.total}
        />
        
        <div className="flex items-center gap-2 my-2">
          <input
            type="checkbox"
            id="hasPractical"
            className="w-4 h-4"
            {...register("hasPractical")}
            defaultChecked={data?.hasPractical || false}
          />
          <label htmlFor="hasPractical" className="text-sm font-medium">
            Has Practical Component
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

export default ExamTypeForm;
