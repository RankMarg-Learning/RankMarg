import React from "react";
import { Controller } from "react-hook-form";
import Select from "react-select";
import { QCategory } from "@prisma/client"; // Adjust if necessary
import { TextFormator } from "@/utils/textFormator";

type Props = {
  control: any;
  errors: any;
};

const categoryOptions = Object.values(QCategory).map((cat) => ({
  label: TextFormator(cat),  // assuming `QCategory` has string values
  value: cat,
}));

export function CategoryMultiSelect({ control, errors }: Props) {
  return (
    <div className="space-y-2">
      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
        Category <span className="text-red-500">*</span>
      </label>

      <Controller
        control={control}
        name="category"
        render={({ field }) => {
          return (
            <>
              <Select
                isMulti
                name="category"
                options={categoryOptions}
                value={field.value ? field.value.map((cat:QCategory) => ({ label: TextFormator(cat), value: cat })) : []}
                onChange={(selectedOptions) => {
                  field.onChange(selectedOptions ? selectedOptions.map((opt: { value: QCategory }) => opt.value) : []);
                }}
                className=" text-sm"
                classNamePrefix="react-select"
              />
              {errors.category && (
                <p className="text-red-500 text-xs">{errors.category.message}</p>
              )}
            </>
          );
        }}
      />
    </div>
  );
}
