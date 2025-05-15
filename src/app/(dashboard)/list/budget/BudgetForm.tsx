"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { BudgetSchema, budgetSchema } from "@/lib/formValidationSchemas";
import { createBudget, updateBudget } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";
import DateTimeField from "@/components/DateTimeField";

const BudgetForm = ({
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
    setValue,
    watch,
  } = useForm<BudgetSchema>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      title: data?.title || "",
      totalAmount: data?.totalAmount || 0,
      allocatedDate: data?.allocatedDate ? new Date(data.allocatedDate) : new Date(),
      endDate: data?.endDate ? new Date(data.endDate) : undefined,
      description: data?.description || "",
      category: data?.category || "Operations",
      utilizedAmount: data?.utilizedAmount || 0,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createBudget : updateBudget,
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
      toast(`Budget has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const categoryOptions = [
    { value: "Operations", label: "Operations" },
    { value: "Infrastructure", label: "Infrastructure" },
    { value: "Academics", label: "Academics" },
    { value: "Transportation", label: "Transportation" },
    { value: "Technology", label: "Technology" },
    { value: "Events", label: "Events" },
    { value: "Staff", label: "Staff & Admin" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Other", label: "Other" },
  ];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new budget" : "Update budget"}
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
          label="Total Amount"
          name="totalAmount"
          type="number"
        //   step="0.01"
          defaultValue={data?.totalAmount?.toString()}
          register={register}
          error={errors?.totalAmount}
        />
        
        <DateTimeField
          label="Allocation Date"
          name="allocatedDate"
          defaultValue={data?.allocatedDate}
          register={register}
          setValue={setValue}
          error={errors?.allocatedDate}
        />
        
        <DateTimeField
          label="End Date (Optional)"
          name="endDate"
          defaultValue={data?.endDate}
          register={register}
          setValue={setValue}
          error={errors?.endDate}
          required={false}
        />
        
        <SelectField
          label="Category"
          name="category"
          defaultValue={data?.category}
          register={register}
          error={errors?.category}
          options={categoryOptions}
        />
        
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
          textarea
        />
        
        {type === "update" && (
          <InputField
            label="Utilized Amount"
            name="utilizedAmount"
            type="number"
            // step="0.01"
            defaultValue={data?.utilizedAmount?.toString()}
            register={register}
            error={errors?.utilizedAmount}
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

export default BudgetForm;
