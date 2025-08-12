// no local state
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/utils/test/date-time-picker";
import { Exam, Subject } from "@/types/typeAdmin";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface ExamFormProps {
  initialExam?: Exam;
  subjects: Subject[];
  onSave: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const examSchema = z
  .object({
    name: z.string().min(1, "Exam name is required"),
    fullName: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    minDifficulty: z.number({ invalid_type_error: "Min difficulty must be a number" }).min(1).max(4),
    maxDifficulty: z.number({ invalid_type_error: "Max difficulty must be a number" }).min(1).max(4),
    totalMarks: z.number({ invalid_type_error: "Total marks must be a number" }).min(1),
    duration: z.number({ invalid_type_error: "Duration must be a number" }).min(1),
    negativeMarking: z.boolean(),
    negativeMarkingRatio: z
      .number({ invalid_type_error: "Negative marking ratio must be a number" })
      .min(0, "Ratio must be >= 0")
      .optional(),
    isActive: z.boolean(),
    registrationStartAt: z.date().optional(),
    registrationEndAt: z.date().optional(),
    examDate: z.date().optional(),
  })
  .refine((val) => val.minDifficulty <= val.maxDifficulty, {
    message: "Min difficulty cannot exceed max difficulty",
    path: ["minDifficulty"],
  })
  .refine((val) => (val.negativeMarking ? (val.negativeMarkingRatio ?? 0) > 0 : true), {
    message: "Provide ratio when negative marking is enabled",
    path: ["negativeMarkingRatio"],
  });

type ExamFormValues = z.infer<typeof examSchema>;

const ExamForm = ({ initialExam, subjects, onSave, onCancel }: ExamFormProps) => {
  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      name: initialExam?.name ?? "",
      fullName: initialExam?.fullName ?? "",
      description: initialExam?.description ?? "",
      category: initialExam?.category ?? "",
      minDifficulty: initialExam?.minDifficulty ?? 1,
      maxDifficulty: initialExam?.maxDifficulty ?? 4,
      totalMarks: initialExam?.totalMarks ?? 0,
      duration: initialExam?.duration ?? 0,
      negativeMarking: initialExam?.negativeMarking ?? false,
      negativeMarkingRatio: initialExam?.negativeMarkingRatio ?? undefined,
      isActive: initialExam?.isActive ?? true,
      registrationStartAt: initialExam?.registrationStartAt
        ? new Date(initialExam.registrationStartAt)
        : undefined,
      registrationEndAt: initialExam?.registrationEndAt
        ? new Date(initialExam.registrationEndAt)
        : undefined,
      examDate: initialExam?.examDate ? new Date(initialExam.examDate) : undefined,
    },
  });

  const negativeMarking = watch("negativeMarking");

  const onSubmit = (values: ExamFormValues) => {
    onSave({
      name: values.name,
      fullName: values.fullName || undefined,
      description: values.description || undefined,
      category: values.category || undefined,
      minDifficulty: values.minDifficulty,
      maxDifficulty: values.maxDifficulty,
      totalMarks: values.totalMarks,
      duration: values.duration,
      negativeMarking: values.negativeMarking,
      negativeMarkingRatio: values.negativeMarking ? values.negativeMarkingRatio : undefined,
      isActive: values.isActive,
      registrationStartAt: values.registrationStartAt?.toISOString(),
      registrationEndAt: values.registrationEndAt?.toISOString(),
      examDate: values.examDate?.toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Exam Name *</Label>
        <Input id="name" {...register("name")} className={errors.name ? "border-red-500" : ""} />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" placeholder="e.g., Joint Entrance Examination Main" {...register("fullName")} />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Enter exam description..." {...register("description")} />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input id="category" placeholder="e.g., Engineering, Medical" {...register("category")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minDifficulty">Min Difficulty *</Label>
          <Input
            id="minDifficulty"
            type="number"
            min="1"
            max="4"
            {...register("minDifficulty", { valueAsNumber: true })}
            className={errors.minDifficulty ? "border-red-500" : ""}
          />
          {errors.minDifficulty && (
            <p className="text-red-500 text-xs">{errors.minDifficulty.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="maxDifficulty">Max Difficulty *</Label>
          <Input
            id="maxDifficulty"
            type="number"
            min="1"
            max="4"
            {...register("maxDifficulty", { valueAsNumber: true })}
            className={errors.maxDifficulty ? "border-red-500" : ""}
          />
          {errors.maxDifficulty && (
            <p className="text-red-500 text-xs">{errors.maxDifficulty.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalMarks">Total Marks *</Label>
          <Input
            id="totalMarks"
            type="number"
            min="1"
            {...register("totalMarks", { valueAsNumber: true })}
            className={errors.totalMarks ? "border-red-500" : ""}
          />
          {errors.totalMarks && (
            <p className="text-red-500 text-xs">{errors.totalMarks.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="duration">Duration (minutes) *</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            {...register("duration", { valueAsNumber: true })}
            className={errors.duration ? "border-red-500" : ""}
          />
          {errors.duration && <p className="text-red-500 text-xs">{errors.duration.message}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Controller
          name="negativeMarking"
          control={control}
          render={({ field }) => (
            <Switch id="negativeMarking" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="negativeMarking">Negative Marking</Label>
      </div>

      {negativeMarking && (
        <div>
          <Label htmlFor="negativeMarkingRatio">Negative Marking Ratio</Label>
          <Input
            id="negativeMarkingRatio"
            type="number"
            min="0"
            step="0.01"
            {...register("negativeMarkingRatio", { valueAsNumber: true })}
            className={errors.negativeMarkingRatio ? "border-red-500" : ""}
            placeholder="e.g., 0.25 for 1/4th"
          />
          {errors.negativeMarkingRatio && (
            <p className="text-red-500 text-xs">{errors.negativeMarkingRatio.message}</p>
          )}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
          )}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="registrationStartAt">Registration Start Date</Label>
          <Controller
            name="registrationStartAt"
            control={control}
            render={({ field }) => (
              <DateTimePicker date={field.value} setDate={field.onChange} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="registrationEndAt">Registration End Date</Label>
          <Controller
            name="registrationEndAt"
            control={control}
            render={({ field }) => (
              <DateTimePicker date={field.value} setDate={field.onChange} />
            )}
          />
        </div>
        <div>
          <Label htmlFor="examDate">Exam Date</Label>
          <Controller
            name="examDate"
            control={control}
            render={({ field }) => (
              <DateTimePicker date={field.value} setDate={field.onChange} />
            )}
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialExam ? "Update Exam" : "Add Exam"}
        </Button>
      </div>
    </form>
  );
};

export default ExamForm;
