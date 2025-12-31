"use client";

import { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
}

interface MultiStepFlowProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void | Promise<void>;
  onComplete?: () => void;
  showProgress?: boolean;
  canGoBack?: boolean;
}

export function MultiStepFlow({
  steps,
  currentStep,
  onStepChange,
  onComplete,
  showProgress = true,
  canGoBack = true,
}: MultiStepFlowProps) {
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = async () => {
    if (isLastStep) {
      onComplete?.();
    } else {
      await onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep && canGoBack) {
      onStepChange(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#8da196] mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{currentStepData.title}</span>
          </div>
          <div className="flex gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  index <= currentStep
                    ? "bg-[#30f0a8]"
                    : "bg-[rgba(48,240,168,0.2)]"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[#e8fdf4]">{currentStepData.title}</h3>
          {currentStepData.description && (
            <p className="text-sm text-[#bfe8d7] mt-1">{currentStepData.description}</p>
          )}
        </div>
        <div>{currentStepData.content}</div>
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-4 border-t border-[#1e2a24]">
        {!isFirstStep && canGoBack && (
          <button
            onClick={handleBack}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className={`btn-primary flex-1 flex items-center justify-center gap-2 ${
            isFirstStep && !canGoBack ? "" : "flex-1"
          }`}
        >
          {isLastStep ? (
            <>
              <Check size={16} />
              Complete
            </>
          ) : (
            <>
              Next
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

