import { SubscriptionStatus } from "@repo/db/enums";
import { Crown } from "lucide-react";
import React from "react";

type Props = {
  endDate?: Date | null;
  status?: SubscriptionStatus | null;
  isLoading?: boolean;
  onUpgrade?: () => void;
};

export default function HeaderTrialBadge({ endDate, status, isLoading, onUpgrade }: Props) {
  
  const isTrial = status === "TRIAL" 
  const isActive = status === "ACTIVE"
  const endAt = endDate ? new Date(endDate) : null;

  function daysLeft(end?: Date | null) {
    if (!end || isNaN(end.getTime())) return null;
    const now = new Date();
    const ms = end.getTime() - now.getTime();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  }

  const left = daysLeft(endAt);
  const formattedDate = endAt ? endAt.toLocaleString() : null;
  
  if (isActive) return null;

  return (
    <div className="flex items-center">
      {/* Trial badge / skeleton */}
      {isLoading ? (
        <div className="w-24 sm:w-32 md:w-36 h-5 sm:h-6 rounded-md bg-slate-200 animate-pulse" aria-hidden="true" />
      ) : !status ? (
        null
      ) : isTrial ? (
        <div
          className="group inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-200 shadow-sm"
          role="status"
          aria-live="polite"
          aria-label={left != null ? `Trial ${left} days left` : "Trial user"}
          title={formattedDate ? `Trial ends: ${formattedDate}` : "Trial user"}
        >
          {/* small dot indicator */}
          <span
            className="flex-shrink-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-600 group-hover:scale-110 transition-transform"
            aria-hidden="true"
          />

          <div className="text-xs sm:text-xs text-amber-900 whitespace-nowrap">
            {endAt && left != null ? (
              <>
                <span className="hidden xs:inline">Trial — </span>
                <span className="xs:hidden">T</span>
                {left} day{left === 1 ? "" : "s"}
                <span className="hidden xs:inline"> left</span>
                {left <= 3 && left > 0 && (
                  <span className="ml-1 text-red-600 font-semibold">⚡</span>
                )}
              </>
            ) : (
              <span className="hidden xs:inline">Trial User</span>
            )}
          </div>

          {/* subtle chevron / info - hidden on very small screens */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-60 hidden xs:block"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )  : null}

      {/* Conversion-Focused Upgrade Button for Trial Users */}
      {!isLoading && isTrial && onUpgrade && (
        <button
          onClick={onUpgrade}
          className="ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
          aria-label="Upgrade to premium now"
          title="Upgrade now to unlock all features"
        >
          <Crown size={10} />
          <span className="hidden xs:inline">Upgrade</span>
          <span className="xs:hidden">↑</span>
        </button>
      )}
    </div>
  );
}
