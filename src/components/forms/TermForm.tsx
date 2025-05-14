"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { termSchema, TermSchema } from "@/lib/formValidationSchemas";
import { createTerm, updateTerm } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const TermForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TermSchema>({
    resolver: zodResolver(termSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createTerm : updateTerm,
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
      toast(`Term has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { academicYears } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new term" : "Update the term"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Term Name"
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
        
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Academic Year</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("academicYearId")}
            defaultValue={data?.academicYearId}
          >
            <option value="">Select Academic Year</option>
            {academicYears?.map((year: { id: number; name: string }) => (
              <option value={year.id} key={year.id}>
                {year.name}
              </option>
            ))}
          </select>
          {errors.academicYearId?.message && (
            <p className="text-xs text-red-400">
              {errors.academicYearId.message.toString()}
            </p>
          )}
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

export default TermForm;
