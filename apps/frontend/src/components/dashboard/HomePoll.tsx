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
      setIsHidden(true);
    }
  }, [storageKey]);

  const handleSubmit = async () => {
    if (!selected || submitting || submitted) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post("/m/submit/poll", {
        pollId: poll.id || `poll_${storageKey}`,
        question: poll.question,
        answer: selected
      });

      if (!response.data.success) throw new Error(response.data.message);

      localStorage.setItem(storageKey, selected);
      setSubmitted(true);
      
      // Auto hide after 2 seconds to show the thanks message
      setTimeout(() => {
        setIsHidden(true);
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Couldn't submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isHidden) return null;

  return (
    <Card className="border border-primary-100 overflow-hidden bg-white/50 backdrop-blur-sm group">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-primary-50 via-primary-50/30 to-white border-b border-primary-100">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-gray-900 leading-tight">
              {poll.question}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-primary-100 text-primary-700 border-primary-200 text-[10px] px-1.5 py-0">
                LIVE POLL
              </Badge>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {poll.options.map((opt) => {
            const isSelected = selected === opt.id;

            return (
              <div key={opt.id} className="relative group/opt">
                <button
                  disabled={submitted || submitting}
                  onClick={() => !submitted && setSelected(opt.id)}
                  className={cn(
                    "relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold transition-all duration-300 text-left z-10",
                    submitted
                      ? isSelected
                        ? "border-primary-300 bg-primary-50/30 text-primary-900"
                        : "border-gray-100 bg-white/50 text-gray-500 cursor-default"
                      : isSelected
                        ? "border-primary-600 bg-primary-50 text-primary-900 shadow-md shadow-primary-100 -translate-y-0.5"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50/20 hover:-translate-y-0.5"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300",
                    isSelected
                      ? "border-primary-600 bg-primary-600"
                      : "border-gray-300 group-hover/opt:border-primary-400"
                  )}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="flex-1 truncate">{opt.text}</span>
                </button>
              </div>
            );
          })}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 justify-center p-2 bg-red-50 rounded-lg border border-red-100">
              <span className="text-xs text-red-600 font-medium">{error}</span>
            </div>
          )}

          {/* Footer Actions */}
          {!submitted ? (
            <Button
              onClick={handleSubmit}
              disabled={!selected || submitting}
              className="w-full h-11 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg active:scale-95 transition-all mt-2"
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : null}
              {submitting ? "Submitting..." : "Cast Your Vote"}
            </Button>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center justify-center gap-2 mt-2 animate-in fade-in zoom-in-95 cursor-default">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-bold text-emerald-800">
                Thanks! Hiding poll...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
