"use client";

import { useState, ReactNode } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { PiggyBank, Users, Vault, CheckCircle2, Copy, Share2, QrCode } from "lucide-react";
import { useToast } from "./ToastProvider";
import { MultiStepFlow } from "./MultiStepFlow";
import { useTelegram } from "@/hooks/useTelegram";
import { QRCodeSVG } from "qrcode.react";

interface CircleFormData {
  targetAmount: string;
  lockPeriod: string; // in weeks
  yieldPercentage: string;
  participants: string[];
  circleId?: string;
  shareLink?: string;
}

// Step 1: Create Circle Configuration
function Step1CreateCircle({
  formData,
  updateFormData,
}: {
  formData: CircleFormData;
  updateFormData: (data: Partial<CircleFormData>) => void;
}) {
  const { isConnected } = useAccount();

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-[#bfe8d7] mb-2">Target Amount (USDC)</label>
          <div className="relative">
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="1000"
              value={formData.targetAmount}
              onChange={(e) => updateFormData({ targetAmount: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] text-[#e8fdf4] placeholder:text-[#8da196] focus:outline-none focus:border-[#30f0a8]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8da196]">USDC</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#bfe8d7] mb-2">Lock Period (weeks)</label>
          <select
            value={formData.lockPeriod}
            onChange={(e) => updateFormData({ lockPeriod: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] text-[#e8fdf4] focus:outline-none focus:border-[#30f0a8]"
          >
            <option value="">Select lock period</option>
            <option value="4">4 weeks (1 month)</option>
            <option value="8">8 weeks (2 months)</option>
            <option value="12">12 weeks (3 months)</option>
            <option value="26">26 weeks (6 months)</option>
            <option value="52">52 weeks (1 year)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-[#bfe8d7] mb-2">Yield Percentage (optional)</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="5"
              value={formData.yieldPercentage}
              onChange={(e) => updateFormData({ yieldPercentage: e.target.value })}
              className="w-full px-4 py-3 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] text-[#e8fdf4] placeholder:text-[#8da196] focus:outline-none focus:border-[#30f0a8]"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8da196]">%</span>
          </div>
          <p className="text-xs text-[#8da196] mt-1">Default is 5% if not specified</p>
        </div>
      </div>

      {!isConnected && (
        <div className="p-3 rounded-lg bg-[rgba(255,193,7,0.1)] border border-[#ffc107] text-sm text-[#ffc107]">
          ⚠️ Please connect your wallet to continue
        </div>
      )}
    </div>
  );
}

// Step 2: Add Participants
function Step2Participants({
  formData,
  updateFormData,
}: {
  formData: CircleFormData;
  updateFormData: (data: Partial<CircleFormData>) => void;
}) {
  const [participantInput, setParticipantInput] = useState("");

  const addParticipant = () => {
    const trimmed = participantInput.trim();
    if (trimmed && !formData.participants.includes(trimmed)) {
      updateFormData({ participants: [...formData.participants, trimmed] });
      setParticipantInput("");
    }
  };

  const removeParticipant = (index: number) => {
    updateFormData({
      participants: formData.participants.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#bfe8d7]">
        Add wallet addresses or Telegram handles of friends you want to invite. You can add more later.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Wallet address or Telegram @handle"
          value={participantInput}
          onChange={(e) => setParticipantInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addParticipant()}
          className="flex-1 px-4 py-2 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] text-[#e8fdf4] placeholder:text-[#8da196] focus:outline-none focus:border-[#30f0a8] text-sm"
        />
        <button
          onClick={addParticipant}
          className="px-4 py-2 rounded-lg bg-[rgba(48,240,168,0.12)] border border-[#30f0a8] text-[#30f0a8] text-sm font-medium hover:bg-[rgba(48,240,168,0.2)] transition"
        >
          Add
        </button>
      </div>

      {formData.participants.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#8da196]">Participants ({formData.participants.length}):</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {formData.participants.map((participant, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]"
              >
                <span className="text-sm text-[#bfe8d7] font-mono truncate">{participant}</span>
                <button
                  onClick={() => removeParticipant(index)}
                  className="text-xs text-[#ff6b6b] hover:text-[#ff5252] transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {formData.participants.length === 0 && (
        <p className="text-xs text-[#8da196] italic">
          No participants added yet. You can skip this step and add participants later.
        </p>
      )}
    </div>
  );
}

// Step 3: Setup Vault
function Step3SetupVault({
  formData,
  updateFormData,
}: {
  formData: CircleFormData;
  updateFormData: (data: Partial<CircleFormData>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24] space-y-3">
        <h4 className="text-sm font-semibold text-[#e8fdf4]">Circle Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#bfe8d7]">Target Amount:</span>
            <span className="text-[#30f0a8] font-semibold">{formData.targetAmount || "0"} USDC</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bfe8d7]">Lock Period:</span>
            <span className="text-[#30f0a8] font-semibold">{formData.lockPeriod || "N/A"} weeks</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bfe8d7]">Yield Percentage:</span>
            <span className="text-[#30f0a8] font-semibold">{formData.yieldPercentage || "5"}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#bfe8d7]">Participants:</span>
            <span className="text-[#30f0a8] font-semibold">{formData.participants.length}</span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-lg bg-[rgba(255,193,7,0.1)] border border-[#ffc107] text-sm text-[#ffc107]">
        <p className="font-semibold mb-1">Ready to create your circle?</p>
        <p className="text-xs">
          This will create the circle on-chain. You'll be able to share the Circle ID with friends to join.
        </p>
      </div>
    </div>
  );
}

// Step 4: Success & Share
function Step4Success({
  formData,
}: {
  formData: CircleFormData;
}) {
  const { show } = useToast();
  const { isTelegram } = useTelegram();
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const shareLink = formData.shareLink || `${frontendUrl}/circle/${formData.circleId}`;
  const [showQR, setShowQR] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    show("success", `${label} copied to clipboard!`);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(48,240,168,0.2)] border-2 border-[#30f0a8]">
          <CheckCircle2 size={32} className="text-[#30f0a8]" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#e8fdf4] mb-2">Circle Created Successfully! 🎉</h3>
          <p className="text-sm text-[#bfe8d7]">Your savings circle is ready. Share it with friends to start saving together.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
          <label className="block text-xs text-[#8da196] mb-2">Circle ID</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded bg-gray-900 text-[#30f0a8] font-mono text-sm break-all">
              {formData.circleId}
            </code>
            <button
              onClick={() => copyToClipboard(formData.circleId || "", "Circle ID")}
              className="p-2 rounded-lg bg-[rgba(48,240,168,0.12)] border border-[#30f0a8] hover:bg-[rgba(48,240,168,0.2)] transition"
              title="Copy Circle ID"
            >
              <Copy size={16} className="text-[#30f0a8]" />
            </button>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
          <label className="block text-xs text-[#8da196] mb-2">Share Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareLink}
              className="flex-1 px-3 py-2 rounded bg-gray-900 text-[#30f0a8] font-mono text-sm"
            />
            <button
              onClick={() => copyToClipboard(shareLink, "Share link")}
              className="p-2 rounded-lg bg-[rgba(48,240,168,0.12)] border border-[#30f0a8] hover:bg-[rgba(48,240,168,0.2)] transition"
              title="Copy link"
            >
              <Copy size={16} className="text-[#30f0a8]" />
            </button>
            {isTelegram && (
              <button
                onClick={() => {
                  if (window.Telegram?.WebApp) {
                    window.Telegram.WebApp.openLink(shareLink);
                  }
                }}
                className="p-2 rounded-lg bg-[rgba(48,240,168,0.12)] border border-[#30f0a8] hover:bg-[rgba(48,240,168,0.2)] transition"
                title="Share in Telegram"
              >
                <Share2 size={16} className="text-[#30f0a8]" />
              </button>
            )}
            <button
              onClick={() => setShowQR(!showQR)}
              className="p-2 rounded-lg bg-[rgba(48,240,168,0.12)] border border-[#30f0a8] hover:bg-[rgba(48,240,168,0.2)] transition"
              title="Show QR code"
            >
              <QrCode size={16} className="text-[#30f0a8]" />
            </button>
          </div>
        </div>

        {showQR && (
          <div className="flex justify-center p-4 rounded-lg bg-white">
            <QRCodeSVG value={shareLink} size={200} />
          </div>
        )}

        <div className="pt-4 border-t border-[#1e2a24] space-y-2">
          <p className="text-sm text-[#bfe8d7] font-semibold">Next Steps:</p>
          <ul className="text-xs text-[#8da196] space-y-1 list-disc list-inside">
            <li>Share the Circle ID or link with friends</li>
            <li>Friends can join using the Circle ID</li>
            <li>Start contributing to reach your savings goal</li>
            <li>Set up recurring contributions (optional)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function SavingsCircleCreateFlow() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { show } = useToast();
  const [formData, setFormData] = useState<CircleFormData>({
    targetAmount: "",
    lockPeriod: "",
    yieldPercentage: "5",
    participants: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const updateFormData = (data: Partial<CircleFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 0) {
      // Validate Step 1
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
        show("error", "Please enter a valid target amount");
        return false;
      }
      if (!formData.lockPeriod) {
        show("error", "Please select a lock period");
        return false;
      }
      return true;
    }
    // Steps 2 and 3 don't require validation (participants are optional, step 3 is review)
    return true;
  };

  const handleCreateCircle = async () => {
    if (!isConnected || !address || !walletClient) {
      show("error", "Please connect your wallet first");
      return;
    }

    if (!validateStep(0)) return;

    setLoading(true);
    try {
      const lockPeriodSeconds = parseInt(formData.lockPeriod) * 7 * 24 * 60 * 60; // Convert weeks to seconds
      const yieldBasisPoints = parseFloat(formData.yieldPercentage || "5") * 100; // Convert to basis points
      
      // Generate circle ID (bytes32)
      const { keccak256, toBytes, concat } = await import("viem");
      const timestamp = Date.now().toString();
      const circleIdBytes = concat([toBytes(address), toBytes(timestamp)]);
      const circleId = keccak256(circleIdBytes) as `0x${string}`;

      // Import transaction functions
      const { createCircle } = await import("@/lib/transactions");
      
      // Create circle on-chain
      const { hash: txHash } = await createCircle({
        walletClient,
        circleId: circleId,
        targetAmount: formData.targetAmount,
        lockPeriod: lockPeriodSeconds,
        yieldPercentage: yieldBasisPoints,
      });

      // Wait for transaction to be mined (optional - you can remove this if you want instant feedback)
      // const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || (typeof window !== "undefined" ? window.location.origin : "");
      const shareLink = `${frontendUrl}/circle/${circleId}`;
      updateFormData({ circleId: circleId, shareLink });
      show("success", `Circle created successfully! Transaction: ${txHash.slice(0, 10)}...`);
      setCurrentStep(3); // Go to success step
    } catch (error: any) {
      console.error("Error creating circle:", error);
      show("error", error.shortMessage || error.message || "Failed to create circle");
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = async (step: number) => {
    // Validate current step before moving forward
    if (step > currentStep && !validateStep(currentStep)) {
      return; // Don't advance if validation fails
    }
    
    // When moving from step 2 (vault setup) to step 3 (success), create the circle
    if (step === 3 && currentStep === 2 && !formData.circleId) {
      // This will create the circle and then advance to step 3 (success)
      await handleCreateCircle();
    } else {
      setCurrentStep(step);
    }
  };

  const steps = [
    {
      id: "create",
      title: "Create Circle",
      description: "Set your savings target and lock period",
      content: <Step1CreateCircle formData={formData} updateFormData={updateFormData} />,
    },
    {
      id: "participants",
      title: "Add Participants",
      description: "Invite friends to join your circle",
      content: <Step2Participants formData={formData} updateFormData={updateFormData} />,
    },
    {
      id: "vault",
      title: "Setup Vault",
      description: "Review and create your circle",
      content: <Step3SetupVault formData={formData} updateFormData={updateFormData} />,
    },
    {
      id: "success",
      title: "Success",
      description: "Share your circle with friends",
      content: <Step4Success formData={formData} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#bfe8d7]">
        <PiggyBank size={16} className="text-[#30f0a8]" /> Create Savings Circle
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

