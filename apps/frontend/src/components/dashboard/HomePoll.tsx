"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@repo/common-ui";
import { Button } from "@repo/common-ui";
import { Badge } from "@repo/common-ui";
import { BarChart2, CheckCircle2, Loader2 } from "lucide-react";
import { PollItem } from "@/types/homeConfig.types";
import { cn } from "@/lib/utils";
import api from "@/utils/api";

const STORAGE_PREFIX = "rankmarg_poll_";

interface HomePollProps {
  poll: PollItem;
  submitApi: string;
}

export default function HomePoll({ poll, submitApi }: HomePollProps) {
  const storageKey = `${STORAGE_PREFIX}${btoa(poll.question).slice(0, 20)}`;

  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const isAlreadySubmitted = localStorage.getItem(storageKey);
    if (isAlreadySubmitted) {
      setSelected(isAlreadySubmitted);
      setSubmitted(true);
      setIsHidden(true);
    }
  }, [storageKey]);

  const handleSubmit = async () => {
    if (!selected || submitting || submitted) return;
    setSubmitting(true);
    setError(null);

    try {
      const submitUrl = "/m/submit/poll";
      
      const response = await api.post(submitUrl, {
        pollId: poll.id || `poll_${storageKey}`,
        question: poll.question,
        answer: selected
      })

      if (!response.data.success) throw new Error(response.data.message);

      localStorage.setItem(storageKey, selected);
      setSubmitted(true);
      
      setTimeout(() => {
        setIsHidden(true);
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Couldn't submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isHidden) return null;

  return (
    <Card className="border border-primary-100 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-4 pb-3 bg-gradient-to-r from-primary-50 to-primary-100/60 border-b border-primary-100">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-primary-900 leading-tight line-clamp-2">
              {poll.question}
            </h3>
          </div>
          <Badge
            variant="outline"
            className="flex-shrink-0 text-[10px] bg-white/70 text-primary-700 border-primary-200"
          >
            Poll
          </Badge>
        </div>

        {/* Options */}
        <div className="px-4 py-3 space-y-2">
          {poll.options.map((opt) => {
            const isSelected = selected === opt.id;
            const isVoted = submitted && isSelected;

            return (
              <button
                key={opt.id}
                disabled={submitted || submitting}
                onClick={() => !submitted && setSelected(opt.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left",
                  submitted
                    ? isVoted
                      ? "border-primary-400 bg-primary-50 text-primary-800"
                      : "border-gray-100 bg-gray-50 text-gray-400 cursor-default"
                    : isSelected
                      ? "border-primary-400 bg-primary-50 text-primary-800 ring-1 ring-primary-300"
                      : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50/50"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-200",
                    isVoted
                      ? "border-primary-500 bg-primary-500"
                      : isSelected
                        ? "border-primary-500 bg-primary-100"
                        : "border-gray-300"
                  )}
                />
                <span className="flex-1 truncate">{opt.text}</span>
                {isVoted && (
                  <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0" />
                )}
              </button>
            );
          })}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 text-center pt-1">{error}</p>
          )}

          {/* Submit / Submitted */}
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              size="sm"
              className="w-full mt-1 h-9 text-sm font-semibold"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : null}
              {submitting ? "Submitting…" : "Submit Answer"}
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-1.5 py-2 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Thanks for sharing your response!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
