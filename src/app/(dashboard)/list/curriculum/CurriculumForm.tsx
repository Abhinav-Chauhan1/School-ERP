"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "@/components/InputField";
import { CurriculumSchema, curriculumSchema } from "@/lib/formValidationSchemas";
import { createCurriculum, updateCurriculum } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import SelectField from "@/components/SelectField";
import MultiSelectField from "@/components/MultiSelectField";

const CurriculumForm = ({
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
    subjects?: any[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CurriculumSchema>({
    resolver: zodResolver(curriculumSchema),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      gradeId: data?.gradeId || undefined,
      academicYearId: data?.academicYearId || undefined,
      subjects: data?.subjects?.map((sub: any) => Number(sub.id)) || [],
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createCurriculum : updateCurriculum,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    // No need for transformation - the data already matches the schema
    console.log(formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Curriculum has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const handleMultiSelectChange = (selectedOptions: string[]) => {
    // Convert string array to number array
    setValue("subjects", selectedOptions.map(id => Number(id)));
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new curriculum" : "Update the curriculum"}
      </h1>

      <div className="flex flex-col gap-4">
        <InputField
          label="Curriculum Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        
        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
          textarea
        />
        
        <SelectField
          label="Grade"
          name="gradeId"
          defaultValue={data?.gradeId?.toString()}
          register={register}
          error={errors?.gradeId}
          options={
            relatedData.grades?.map(grade => ({
              value: grade.id.toString(),
              label: `Grade ${grade.level}`
            })) || []
          }
        />
        
        <SelectField
          label="Academic Year"
          name="academicYearId"
          defaultValue={data?.academicYearId?.toString()}
          register={register}
          error={errors?.academicYearId}
          options={
            relatedData.academicYears?.map(year => ({
              value: year.id.toString(),
              label: year.name
            })) || []
          }
        />
        
        <MultiSelectField
          label="Subjects"
          options={
            relatedData.subjects?.map(subject => ({
              value: subject.id.toString(),
              label: subject.name
            })) || []
          }
          defaultValues={data?.subjects?.map((s: any) => s.id.toString()) || []}
          onChange={handleMultiSelectChange}
          error={errors?.subjects}
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

export default CurriculumForm;
