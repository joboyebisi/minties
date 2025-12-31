"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Users, CheckCircle2, Coins } from "lucide-react";
import { useToast } from "./ToastProvider";
import { MultiStepFlow } from "./MultiStepFlow";

interface JoinFormData {
  circleId: string;
  amount: string;
  circleStatus?: any;
}

// Step 1: Enter Circle ID
function Step1EnterCircleId({
  formData,
  updateFormData,
}: {
  formData: JoinFormData;
  updateFormData: (data: Partial<JoinFormData>) => void;
}) {
  const [loading, setLoading] = useState(false);
  const { show } = useToast();

  const handleLoadCircle = async () => {
    if (!formData.circleId.trim()) {
      show("error", "Please enter a Circle ID");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/circle/${formData.circleId}/status`
      );
      const data = await response.json();
      
      if (data.success && data.status) {
        updateFormData({ circleStatus: data.status });
        show("success", "Circle found! Review details below.");
      } else {
        show("error", "Circle not found or invalid Circle ID");
        updateFormData({ circleStatus: null });
      }
    } catch (error: any) {
      show("error", error.message || "Failed to load circle");
      updateFormData({ circleStatus: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-[#bfe8d7] mb-2">Circle ID</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter Circle ID"
            value={formData.circleId}
            onChange={(e) => {
              updateFormData({ circleId: e.target.value, circleStatus: null });
            }}
            onKeyPress={(e) => e.key === "Enter" && handleLoadCircle()}
            className="flex-1 px-4 py-3 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] text-[#e8fdf4] placeholder:text-[#8da196] focus:outline-none focus:border-[#30f0a8] font-mono text-sm"
          />
          <button
            onClick={handleLoadCircle}
            disabled={loading || !formData.circleId.trim()}
            className="px-4 py-3 rounded-lg bg-[rgba(48,240,168,0.12)] border border-[#30f0a8] text-[#30f0a8] font-medium hover:bg-[rgba(48,240,168,0.2)] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load"}
          </button>
        </div>
      </div>

      {formData.circleStatus && (
        <div className="p-4 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] space-y-2">
          <h4 className="text-sm font-semibold text-[#e8fdf4]">Circle Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#bfe8d7]">Target Amount:</span>
              <span className="text-[#30f0a8] font-semibold">{formData.circleStatus.targetAmount} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#bfe8d7]">Total Contributed:</span>
              <span className="text-[#30f0a8] font-semibold">{formData.circleStatus.totalContributed || "0"} USDC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#bfe8d7]">Members:</span>
              <span className="text-[#30f0a8] font-semibold">{formData.circleStatus.memberCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#bfe8d7]">Status:</span>
              <span className={`font-semibold ${formData.circleStatus.isActive ? "text-[#30f0a8]" : "text-[#ff6b6b]"}`}>
                {formData.circleStatus.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 2: Join & Contribute
function Step2Join({
  formData,
  updateFormData,
}: {
  formData: JoinFormData;
  updateFormData: (data: Partial<JoinFormData>) => void;
}) {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-[#bfe8d7] mb-2">Initial Contribution Amount (USDC)</label>
        <div className="relative">
          <input
            type="number"
            min="0.01"
            step="0.01"
            placeholder="50"
            value={formData.amount}
            onChange={(e) => updateFormData({ amount: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] text-[#e8fdf4] placeholder:text-[#8da196] focus:outline-none focus:border-[#30f0a8]"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8da196]">USDC</span>
        </div>
        <p className="text-xs text-[#8da196] mt-1">
          You can contribute more later. Minimum contribution may apply.
        </p>
      </div>

      {formData.circleStatus && (
        <div className="p-4 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] space-y-2">
          <h4 className="text-sm font-semibold text-[#e8fdf4]">Review</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-[#bfe8d7]">Circle ID:</span>
              <span className="text-[#30f0a8] font-mono text-xs">{formData.circleId.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#bfe8d7]">Your Contribution:</span>
              <span className="text-[#30f0a8] font-semibold">{formData.amount || "0"} USDC</span>
            </div>
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="p-3 rounded-lg bg-[rgba(255,193,7,0.1)] border border-[#ffc107] text-sm text-[#ffc107]">
          ⚠️ Please connect your wallet to continue
        </div>
      )}
    </div>
  );
}

// Step 3: Success
function Step3Success({
  formData,
}: {
  formData: JoinFormData;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(48,240,168,0.2)] border-2 border-[#30f0a8]">
          <CheckCircle2 size={32} className="text-[#30f0a8]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#e8fdf4] mb-2">Joined Circle Successfully! 🎉</h3>
          <p className="text-sm text-[#bfe8d7]">
            You've joined the savings circle and contributed {formData.amount} USDC.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] space-y-2">
        <h4 className="text-sm font-semibold text-[#e8fdf4]">Circle Details</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-[#bfe8d7]">Circle ID:</span>
            <span className="text-[#30f0a8] font-mono text-xs">{formData.circleId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bfe8d7]">Your Contribution:</span>
            <span className="text-[#30f0a8] font-semibold">{formData.amount} USDC</span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#1e2a24] space-y-2">
        <p className="text-sm text-[#bfe8d7] font-semibold">Next Steps:</p>
        <ul className="text-xs text-[#8da196] space-y-1 list-disc list-inside">
          <li>You can contribute more anytime</li>
          <li>Track progress with other members</li>
          <li>Set up recurring contributions (optional)</li>
        </ul>
      </div>
    </div>
  );
}

// Main Component
export function SavingsCircleJoinFlow() {
  const { address, isConnected } = useAccount();
  const { show } = useToast();
  const [formData, setFormData] = useState<JoinFormData>({
    circleId: "",
    amount: "",
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const updateFormData = (data: Partial<JoinFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 0) {
      if (!formData.circleId.trim()) {
        show("error", "Please enter a Circle ID");
        return false;
      }
      if (!formData.circleStatus) {
        show("error", "Please load circle details first");
        return false;
      }
      return true;
    }
    if (step === 1) {
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        show("error", "Please enter a valid contribution amount");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleJoinAndContribute = async () => {
    if (!isConnected || !address) {
      show("error", "Please connect your wallet first");
      return;
    }

    if (!validateStep(1)) return;

    setLoading(true);
    try {
      // First join the circle
      const joinResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/circle/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: address,
          circleId: formData.circleId,
        }),
      });

      const joinData = await joinResponse.json();
      if (!joinData.success) {
        show("error", joinData.error || "Failed to join circle");
        return;
      }

      // Then contribute
      const contributeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/circle/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: address,
          circleId: formData.circleId,
          amount: parseFloat(formData.amount),
        }),
      });

      const contributeData = await contributeResponse.json();
      if (contributeData.success) {
        show("success", "Successfully joined and contributed!");
        setCurrentStep(2); // Go to success step
      } else {
        show("error", contributeData.error || "Failed to contribute");
      }
    } catch (error: any) {
      show("error", error.message || "Failed to join circle");
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = async (step: number) => {
    // Validate current step before moving forward
    if (step > currentStep && !validateStep(currentStep)) {
      return; // Don't advance if validation fails
    }

    // When moving from step 1 to step 2, join and contribute
    if (step === 2 && currentStep === 1) {
      await handleJoinAndContribute();
    } else {
      setCurrentStep(step);
    }
  };

  const steps = [
    {
      id: "enter-id",
      title: "Enter Circle ID",
      description: "Load circle details to join",
      content: <Step1EnterCircleId formData={formData} updateFormData={updateFormData} />,
    },
    {
      id: "join",
      title: "Join & Contribute",
      description: "Make your initial contribution",
      content: <Step2Join formData={formData} updateFormData={updateFormData} />,
    },
    {
      id: "success",
      title: "Success",
      description: "You've joined the circle",
      content: <Step3Success formData={formData} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#bfe8d7]">
        <Users size={16} className="text-[#30f0a8]" /> Join Savings Circle
      </div>
      <MultiStepFlow
        steps={steps}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        showProgress={true}
        canGoBack={true}
      />
    </div>
  );
}

