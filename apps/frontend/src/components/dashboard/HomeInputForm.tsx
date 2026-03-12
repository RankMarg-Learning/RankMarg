"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import { Badge } from "@repo/common-ui";
import { ClipboardList, Loader2, CheckCircle2 } from "lucide-react";
import { InputItem } from "@/types/homeConfig.types";
import { cn } from "@/lib/utils";
import api from "@/utils/api";

const FIELD_LABELS: Record<string, string> = {
  application_number: "Application Number",
  date_of_birth: "Date of Birth",
  mother_name: "Mother's Name",
  other: "Other",
};

interface HomeInputFormProps {
  inputItem: InputItem;
  submitApi?: string;
}

export default function HomeInputForm({
  inputItem,
  submitApi,
}: HomeInputFormProps) {
  const fieldKeys = useMemo(
    () => Object.keys(inputItem.fields),
    [inputItem.fields]
  );

  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fieldKeys.forEach((k) => {
      initial[k] = inputItem.fields[k] ?? "";
    });
    return initial;
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const isAlreadySubmitted = localStorage.getItem(`submitted_input_${inputItem.id}`);
    if (isAlreadySubmitted === "true") {
      setIsHidden(true);
    }
  }, [inputItem.id]);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitApi || submitting || submitted) return;
    setSubmitting(true);
    setError(null);

    try {
      const submitUrl = "/m/submit/form";

      const res = await api.post(submitUrl, {
        formId: inputItem.id,
        values: values
      })
      if (!res.data.success) throw new Error("Server error");

      setSubmitted(true);
      localStorage.setItem(`submitted_input_${inputItem.id}`, "true");

      setTimeout(() => {
        setIsHidden(true);
      }, 3000);
    } catch {
      setError("Submission failed. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const getInputType = (key: string) => {
    if (key.includes("date")) return "date";
    if (key.includes("pin") || key.includes("number")) return "text";
    return "text";
  };

  if (isHidden) return null;

  return (
    <Card className="border border-amber-100 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-amber-900 line-clamp-2 leading-tight">
              {inputItem.text}
            </h3>
          </div>
          <Badge
            variant="outline"
            className="flex-shrink-0 text-[10px] bg-white/70 text-amber-700 border-amber-200"
          >
            Form
          </Badge>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="px-4 py-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fieldKeys.map((key) => (
              <div key={key} className="flex flex-col gap-1">
                <label
                  htmlFor={`home-input-${key}`}
                  className="text-xs font-medium text-gray-700"
                >
                  {FIELD_LABELS[key] ?? key.replace(/_/g, " ")}
                </label>
                <input
                  id={`home-input-${key}`}
                  type={getInputType(key)}
                  value={values[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  disabled={submitted}
                  placeholder={`Enter ${FIELD_LABELS[key] ?? key}`}
                  className={cn(
                    "w-full text-sm rounded-lg border px-3 py-2 outline-none transition-all duration-200",
                    "focus:ring-2 focus:ring-amber-300 focus:border-amber-400",
                    submitted
                      ? "bg-gray-50 text-gray-400 cursor-default border-gray-100"
                      : "bg-white border-gray-200 text-gray-800 hover:border-amber-300"
                  )}
                />
              </div>
            ))}
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center">{error}</p>
          )}

          {!submitted ? (
            <Button
              type="submit"
              disabled={!submitApi || submitting}
              size="sm"
              className="w-full h-9 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white border-0 mt-1"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              {submitting ? "Submitting…" : "Submit Details"}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 py-2 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Details submitted successfully!
            </div>
          )}


        </form>
      </CardContent>
    </Card>
  );
}
