"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { FeePaymentSchema, feePaymentSchema } from "@/lib/formValidationSchemas";
import { createFeePayment, updateFeePayment } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "ONLINE", label: "Online Payment" },
];

const PAYMENT_STATUSES = [
  { value: "PAID", label: "Paid" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const FeePaymentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    students?: any[];
    feeStructures?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FeePaymentSchema>({
    resolver: zodResolver(feePaymentSchema),
    defaultValues: {
      id: data?.id,
      amount: data?.amount || 0,
      paymentDate: data?.paymentDate ? new Date(data.paymentDate) : new Date(),
      paymentMethod: data?.paymentMethod || "CASH",
      transactionId: data?.transactionId || "",
      status: data?.status || "PAID",
      studentId: data?.studentId || "",
      feeStructureId: data?.feeStructureId || undefined,
      receiptNumber: data?.receiptNumber || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createFeePayment : updateFeePayment,
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
      toast(`Fee payment has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Format date for input fields
  const formatDateForInput = (date: Date | undefined | null) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 10);
  };

  // Auto-fill amount when fee structure changes
  const selectedFeeStructureId = watch("feeStructureId");
  useEffect(() => {
    if (selectedFeeStructureId && type === "create") {
      const selectedFeeStructure = relatedData.feeStructures?.find(
        fs => fs.id === parseInt(selectedFeeStructureId.toString())
      );
      if (selectedFeeStructure) {
        setValue("amount", selectedFeeStructure.amount);
      }
    }
  }, [selectedFeeStructureId, relatedData.feeStructures, setValue, type]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new fee payment" : "Update the fee payment"}
      </h1>

      <div className="flex flex-col gap-4">
        <SelectField
          label="Student"
          name="studentId"
          defaultValue={data?.studentId}
          register={register}
          error={errors?.studentId}
          options={
            relatedData.students?.map(student => ({
              value: student.id,
              label: `${student.name} ${student.surname}`
            })) || []
          }
        />
        
        <SelectField
          label="Fee Structure"
          name="feeStructureId"
          defaultValue={data?.feeStructureId?.toString()}
          register={register}
          error={errors?.feeStructureId}
          options={
            relatedData.feeStructures?.map(fee => ({
              value: fee.id.toString(),
              label: `${fee.name} (${new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(fee.amount)})`
            })) || []
          }
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            defaultValue={data?.amount || 0}
            register={register}
            error={errors?.amount}
          />
          
          <InputField
            label="Payment Date"
            name="paymentDate"
            type="date"
            defaultValue={formatDateForInput(data?.paymentDate || new Date())}
            register={register}
            error={errors?.paymentDate}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Payment Method"
            name="paymentMethod"
            defaultValue={data?.paymentMethod || "CASH"}
            register={register}
            error={errors?.paymentMethod}
            options={PAYMENT_METHODS}
          />
          
          <SelectField
            label="Status"
            name="status"
            defaultValue={data?.status || "PAID"}
            register={register}
            error={errors?.status}
            options={PAYMENT_STATUSES}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Transaction ID (Optional)"
            name="transactionId"
            defaultValue={data?.transactionId || ""}
            register={register}
            error={errors?.transactionId}
          />
          
          <InputField
            label="Receipt Number (Optional)"
            name="receiptNumber"
            defaultValue={data?.receiptNumber || ""}
            register={register}
            error={errors?.receiptNumber}
          />
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

export default FeePaymentForm;
