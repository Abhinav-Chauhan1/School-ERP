"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { FeeStructureSchema, feeStructureSchema } from "@/lib/formValidationSchemas";
import { createFeeStructure, updateFeeStructure } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const FEE_TYPES = [
  { value: "TUITION", label: "Tuition Fee" },
  { value: "TRANSPORTATION", label: "Transportation Fee" },
  { value: "EXAMINATION", label: "Examination Fee" },
  { value: "LIBRARY", label: "Library Fee" },
  { value: "LABORATORY", label: "Laboratory Fee" },
  { value: "SPORTS", label: "Sports Fee" },
  { value: "MISCELLANEOUS", label: "Miscellaneous Fee" },
];

const FeeStructureForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    grades?: any[];
    academicYears?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FeeStructureSchema>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name || "",
      amount: data?.amount || 0,
      description: data?.description || "",
      dueDate: data?.dueDate ? new Date(data.dueDate) : undefined,
      feeType: data?.feeType || "TUITION",
      academicYear: data?.academicYear || "",
      gradeId: data?.gradeId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createFeeStructure : updateFeeStructure,
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
      toast(`Fee Structure has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Format date for input fields
  const formatDateForInput = (date: Date | undefined | null) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new fee structure" : "Update the fee structure"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Fee Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Amount"
            name="amount"
            type="number"
            // step="0.01"
            defaultValue={data?.amount || 0}
            register={register}
            error={errors?.amount}
          />
          
          <SelectField
            label="Fee Type"
            name="feeType"
            defaultValue={data?.feeType || "TUITION"}
            register={register}
            error={errors?.feeType}
            options={FEE_TYPES}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Grade (Optional)"
            name="gradeId"
            defaultValue={data?.gradeId?.toString()}
            register={register}
            error={errors?.gradeId}
            options={[
              { value: "", label: "All Grades" },
              ...(relatedData.grades?.map(grade => ({
                value: grade.id.toString(),
                label: `Grade ${grade.level}`
              })) || [])
            ]}
          />
          
          <InputField
            label="Academic Year (Optional)"
            name="academicYear"
            defaultValue={data?.academicYear || ""}
            register={register}
            error={errors?.academicYear}
            placeholder={relatedData.academicYears?.[0]?.name || "e.g. 2023-2024"}
          />
        </div>
        
        <InputField
          label="Due Date (Optional)"
          name="dueDate"
          type="date"
          defaultValue={formatDateForInput(data?.dueDate)}
          register={register}
          error={errors?.dueDate}
        />
        
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description || ""}
          register={register}
          error={errors?.description}
          textarea
          rows={3}
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

export default FeeStructureForm;
