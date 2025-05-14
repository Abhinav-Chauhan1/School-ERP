"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { PayrollSchema, payrollSchema } from "@/lib/formValidationSchemas";
import { createPayroll, updatePayroll } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

// Generate months options for dropdown
const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

// Generate year options - current year +/- 3 years
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 3; i <= currentYear + 3; i++) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};

const PayrollForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    teachers?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PayrollSchema>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      id: data?.id,
      amount: data?.amount || 0,
      payDate: data?.payDate ? new Date(data.payDate) : new Date(),
      teacherId: data?.teacherId || "",
      month: data?.month || new Date().getMonth() + 1,
      year: data?.year || new Date().getFullYear(),
      taxAmount: data?.taxAmount || 0,
      netSalary: data?.netSalary || 0,
      bonusAmount: data?.bonusAmount || 0,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createPayroll : updatePayroll,
    {
      success: false,
      error: false,
    }
  );

  // Watch for changes to calculate net salary automatically
  const amount = watch("amount");
  const taxAmount = watch("taxAmount");
  const bonusAmount = watch("bonusAmount");

  // Calculate net salary whenever amount, tax, or bonus changes
  useEffect(() => {
    const grossAmount = parseFloat(amount?.toString() || "0");
    const tax = parseFloat(taxAmount?.toString() || "0");
    const bonus = parseFloat(bonusAmount?.toString() || "0");
    const net = grossAmount - tax + bonus;
    setValue("netSalary", net);
  }, [amount, taxAmount, bonusAmount, setValue]);

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Payroll has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Format date for input fields
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new payroll record" : "Update the payroll record"}
      </h1>

      <div className="flex flex-col gap-4">
        <SelectField
          label="Teacher"
          name="teacherId"
          defaultValue={data?.teacherId}
          register={register}
          error={errors?.teacherId}
          options={
            relatedData.teachers?.map(teacher => ({
              value: teacher.id,
              label: `${teacher.name} ${teacher.surname}`
            })) || []
          }
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Month"
            name="month"
            defaultValue={data?.month?.toString() || (new Date().getMonth() + 1).toString()}
            register={register}
            error={errors?.month}
            options={MONTHS}
          />
          
          <SelectField
            label="Year"
            name="year"
            defaultValue={data?.year?.toString() || new Date().getFullYear().toString()}
            register={register}
            error={errors?.year}
            options={generateYearOptions()}
          />
        </div>
        
        <InputField
          label="Payment Date"
          name="payDate"
          type="date"
          defaultValue={formatDateForInput(data?.payDate || new Date())}
          register={register}
          error={errors?.payDate}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Gross Salary Amount"
            name="amount"
            type="number"
            // step="0.01"
            defaultValue={data?.amount || 0}
            register={register}
            error={errors?.amount}
          />
          
          <InputField
            label="Tax Deduction"
            name="taxAmount"
            type="number"
            // step="0.01"
            defaultValue={data?.taxAmount || 0}
            register={register}
            error={errors?.taxAmount}
          />
          
          <InputField
            label="Bonus Amount"
            name="bonusAmount"
            type="number"
            // step="0.01"
            defaultValue={data?.bonusAmount || 0}
            register={register}
            error={errors?.bonusAmount}
          />
        </div>
        
        <InputField
          label="Net Salary"
          name="netSalary"
          type="number"
        //   step="0.01"
          defaultValue={data?.netSalary || 0}
          register={register}
          error={errors?.netSalary}
          disabled
          className="bg-gray-100"
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

export default PayrollForm;
