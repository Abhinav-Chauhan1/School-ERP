"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { SyllabusSchema, syllabusSchema } from "@/lib/formValidationSchemas";
import { createSyllabus, updateSyllabus } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";

const SyllabusForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    subjects?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SyllabusSchema>({
    resolver: zodResolver(syllabusSchema),
    defaultValues: {
      content: data?.content || "",
      description: data?.description || "",
      subjectId: data?.subjectId || undefined,
      completion: data?.completion || 0,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSyllabus : updateSyllabus,
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
      toast(`Syllabus has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new syllabus" : "Update the syllabus"}
      </h1>

      <div className="flex flex-col gap-4">
        <SelectField
          label="Subject"
          name="subjectId"
          defaultValue={data?.subjectId?.toString()}
          register={register}
          error={errors?.subjectId}
          options={
            relatedData.subjects?.map(subject => ({
              value: subject.id.toString(),
              label: subject.name
            })) || []
          }
        />
        
        <InputField
          label="Content"
          name="content"
          defaultValue={data?.content}
          register={register}
          error={errors?.content}
          textarea
          rows={6}
        />
        
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
          textarea
        />
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Completion Percentage</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              {...register("completion", { valueAsNumber: true })}
              defaultValue={data?.completion || 0}
            />
            <span className="bg-gray-100 px-2 py-1 rounded-md min-w-[50px] text-center">
              {watch("completion") || 0}%
            </span>
          </div>
          {errors?.completion && (
            <span className="text-red-500 text-sm">{errors.completion.message}</span>
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

export default SyllabusForm;
