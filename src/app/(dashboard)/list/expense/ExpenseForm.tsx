"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { ExpenseSchema, expenseSchema } from "@/lib/formValidationSchemas";
import { createExpense, updateExpense } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";
import DateTimeField from "@/components/DateTimeField";

const ExpenseForm = ({
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
  } = useForm<ExpenseSchema>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: data?.title || "",
      amount: data?.amount || 0,
      date: data?.date ? new Date(data.date) : new Date(),
      category: data?.category || "Supplies",
      description: data?.description || "",
      receipt: data?.receipt || "",
      approvedBy: data?.approvedBy || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExpense : updateExpense,
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
      toast(`Expense has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const categoryOptions = [
    { value: "Supplies", label: "Supplies" },
    { value: "Maintenance", label: "Maintenance" },
    { value: "Utilities", label: "Utilities" },
    { value: "Salary", label: "Salary" },
    { value: "Transportation", label: "Transportation" },
    { value: "Events", label: "Events" },
    { value: "Equipment", label: "Equipment" },
    { value: "Software", label: "Software" },
    { value: "Other", label: "Other" },
  ];

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new expense" : "Update the expense"}
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
          label="Amount"
          name="amount"
          type="number"
        //   step="0.01"
          defaultValue={data?.amount?.toString()}
          register={register}
          error={errors?.amount}
        />
        
        <DateTimeField
          label="Date"
          name="date"
          defaultValue={data?.date}
          register={register}
          setValue={setValue}
          error={errors?.date}
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
        
        <InputField
          label="Receipt URL"
          name="receipt"
          defaultValue={data?.receipt}
          register={register}
          error={errors?.receipt}
        />
        
        <InputField
          label="Approved By"
          name="approvedBy"
          defaultValue={data?.approvedBy}
          register={register}
          error={errors?.approvedBy}
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

export default ExpenseForm;
