"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { academicYearSchema, AcademicYearSchema } from "@/lib/formValidationSchemas";
import { createAcademicYear, updateAcademicYear } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AcademicYearForm = ({
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
  } = useForm<AcademicYearSchema>({
    resolver: zodResolver(academicYearSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAcademicYear : updateAcademicYear,
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
      toast(`Academic year has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new academic year" : "Update the academic year"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Academic Year Name"
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
        
        <InputField
          label="Start Date"
          name="startDate"
          type="date"
          defaultValue={data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : ""}
          register={register}
          error={errors?.startDate}
        />
        
        <InputField
          label="End Date"
          name="endDate"
          type="date"
          defaultValue={data?.endDate ? new Date(data.endDate).toISOString().split('T')[0] : ""}
          register={register}
          error={errors?.endDate}
        />
        
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="isCurrent"
            {...register("isCurrent")}
            defaultChecked={data?.isCurrent}
            className="w-4 h-4"
          />
          <label htmlFor="isCurrent" className="text-sm">Is Current Academic Year</label>
        </div>
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

export default AcademicYearForm;
