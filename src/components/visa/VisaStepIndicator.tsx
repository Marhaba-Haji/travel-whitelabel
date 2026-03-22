import { Check } from "lucide-react";

const STEPS = [
  { id: 1, label: "Upload" },
  { id: 2, label: "Details" },
  { id: 3, label: "Verify" },
  { id: 4, label: "Result" },
];

interface VisaStepIndicatorProps {
  currentStep: number;
  canGoToStep: (step: number) => boolean;
  onStepClick: (step: number) => void;
}

export default function VisaStepIndicator({ currentStep, canGoToStep, onStepClick }: VisaStepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full max-w-full overflow-x-auto">
      {STEPS.map((s, idx) => {
        const isCompleted = currentStep > s.id;
        const isCurrent = currentStep === s.id;
        const canGo = canGoToStep(s.id);
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={s.id} className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => canGo && onStepClick(s.id)}
              disabled={!canGo}
              className={`flex items-center gap-1.5 sm:gap-2 transition-colors touch-manipulation ${
                canGo ? "cursor-pointer hover:opacity-90 active:opacity-80" : "cursor-not-allowed opacity-60"
              }`}
            >
              <span
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs sm:text-sm font-medium border shrink-0 ${
                  isCompleted
                    ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                    : isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : s.id}
              </span>
              <span
                className={`hidden sm:inline text-sm font-medium ${
                  isCurrent ? "text-foreground" : isCompleted ? "text-muted-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </button>
            {!isLast && (
              <div
                className={`mx-0.5 sm:mx-1 md:mx-2 h-px w-3 sm:w-5 md:w-8 flex-shrink-0 ${
                  isCompleted ? "bg-green-500/30" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
