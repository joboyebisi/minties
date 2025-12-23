"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { PiggyBank, ArrowRight, Coins } from "lucide-react";
import { useToast } from "./ToastProvider";

export function SavingsCircle() {
  const { address, isConnected } = useAccount();
  const [circleId, setCircleId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { show } = useToast();
  const [mode, setMode] = useState<"start" | "join">("start");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const handleContribute = async () => {
    if (!isConnected || !address) {
      setResult("Please connect your wallet first");
      show("error", "Connect your wallet first");
      return;
    }

    if (!circleId || !amount) {
      setResult("Please enter circle ID and amount");
      show("error", "Enter circle ID and amount");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const userId = address;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/circle/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, circleId, amount: parseFloat(amount) }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(`✅ Contributed ${amount} USDC!`);
        show("success", `Contributed ${amount} USDC`);
      } else {
        setResult(`❌ Error: ${data.error}`);
        show("error", data.error || "Contribution failed");
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
      show("error", error.message || "Contribution failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStartCircle = async () => {
    if (!isConnected || !address) {
      show("error", "Connect your wallet first");
      return;
    }
    // Placeholder: integrate real circle creation API
    const newId = `circle_${Date.now().toString(16)}`;
    setCreatedId(newId);
    show("success", `Circle created: ${newId}. Share this ID with friends.`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#bfe8d7]">
        <PiggyBank size={16} className="text-[#30f0a8]" /> Savings Circle
      </div>

      <div className="flex gap-2 text-sm">
        <button
          className={`px-3 py-2 rounded-full border ${mode === "start" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setMode("start")}
        >
          ✨ Start
        </button>
        <button
          className={`px-3 py-2 rounded-full border ${mode === "join" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setMode("join")}
        >
          🤝 Join
        </button>
      </div>

      {mode === "join" ? (
        <>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
            <ArrowRight size={16} className="text-[#30f0a8]" />
            <input
              type="text"
              placeholder="Circle ID"
              value={circleId}
              onChange={(e) => setCircleId(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-[#e8fdf4] placeholder:text-[#8da196]"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
            <Coins size={16} className="text-[#30f0a8]" />
            <input
              type="number"
              placeholder="Amount (USDC)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-[#e8fdf4] placeholder:text-[#8da196]"
            />
          </div>
          <button
            onClick={handleContribute}
            disabled={loading || !isConnected}
            className="btn-primary w-full text-center disabled:opacity-60"
          >
            {loading ? "Contributing..." : "🚀 Contribute"}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[#bfe8d7]">
            Create a circle and invite friends. You’ll get a Circle ID to share.
          </p>
          <button
            className="btn-primary w-full text-center"
            disabled={!isConnected}
            onClick={handleStartCircle}
          >
            ✨ Start a Circle (share ID)
          </button>
          {createdId && (
            <div className="text-xs text-[#8da196]">
              Circle ID: <span className="text-[#30f0a8]">{createdId}</span>
            </div>
          )}
          <p className="text-xs text-[#8da196]">
            After creation, share the Circle ID or invite link with friends to join.
          </p>
        </div>
      )}

      {result && <p className="text-sm text-[#bfe8d7]">{result}</p>}
      {!isConnected && <p className="text-sm text-[#facc15]">Connect wallet to continue</p>}
    </div>
  );
}

