"use client";

import React, { useEffect, useState as useReactState } from "react";
import Link from "next/link";
import { useAccount, useWalletClient, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ConnectButton } from "@/components/ConnectButton";
import { GiftClaim } from "@/components/GiftClaim";
import { SavingsCircle } from "@/components/SavingsCircle";
import { useTelegram } from "@/hooks/useTelegram";
import { NavBar } from "@/components/NavBar";
import { CTASection } from "@/components/CTASection";
import { FAQ } from "@/components/FAQ";
import { GamificationPanel } from "@/components/GamificationPanel";
import { WalletStatus } from "@/components/WalletStatus";
import { WalletConnectionGuard } from "@/components/WalletConnectionGuard";
import { Gift, PiggyBank, Send, Sparkles, Calculator, Target, Users } from "lucide-react";
import { fetchAaveApy, supplyUsdc, withdrawUsdc } from "@/lib/aave";
import { useToast } from "@/components/ToastProvider";
import { awardPoints, getOrCreateUserProfile, updateStreak } from "@/lib/gamification";

export default function Home() {
  const { isTelegram, user } = useTelegram();
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  return (
    <main className="min-h-screen">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-10 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1e2a24] bg-[rgba(48,240,168,0.08)] text-sm text-[#30f0a8]">
            Telegram Mini App Ready · Save with friends toward a goal
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-[#e8fdf4]">
            MoneyBox, Crypto Gifts & Savings Circles
          </h1>
          <p className="text-base md:text-lg text-[#bfe8d7] max-w-2xl mx-auto">
            Target savings with high yield, send USDC gifts, and save with friends in savings circles—all in one Telegram Mini App. Powered by MetaMask Smart Accounts, Aave DeFi, and Telegram-native sharing.
          </p>
          {isTelegram && user && (
            <p className="text-sm text-[#8da196]">
              Welcome, {user.first_name} {user.last_name || ""}!
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-end mt-4 w-full sm:w-auto">
            <div className="w-full sm:w-48 flex flex-col justify-end">
              <ConnectButton />
            </div>
            <div className="w-full sm:w-48 flex flex-col justify-end">
              <Link
                href="/connect"
                className="btn-primary w-full sm:w-48 text-center"
              >
                View Wallet Status
              </Link>
            </div>
          </div>
        </div>

        {/* Money Box + Gifts */}
        <section id="moneybox" className="space-y-4">
          <WalletConnectionGuard>
            <ActionCard
              title="📈 Money Box (with yield)"
              icon={<Calculator size={18} className="text-[#30f0a8]" />}
              body="Target savings toward a goal and see projected yield (Aave-ready)."
              cta="Get Yield on Your Goal"
              content={<MoneyBoxCalculator />}
            />
          </WalletConnectionGuard>
          {/* Gifts card immediately under Money Box */}
          <CTASection />
        </section>

        {/* Savings & Plans */}
        <section id="circles" className="grid gap-4">
          <ActionCard
            title="💰 Savings & Plans"
            icon={<PiggyBank size={18} className="text-[#30f0a8]" />}
            body="Start a savings circle, money box, travel or BNPL plan with recurring pulls."
            cta="Save & Automate"
            content={<SavingsCircle />}
          />
        </section>

        {/* Feature Highlights */}
        <div id="actions" className="grid gap-4">
          <MiniCard
            title="Recurring Transfers"
            body="Remittance, charity, payroll—schedule with periodic permissions."
          />
          <MiniCard
            title="Travel & BNPL"
            body="Set a target, we compute monthly pulls. Unlock with minty progress."
          />
          <MiniCard
            title="Yield (Aave-ready)"
            body="Optional Aave boost on saved USDC; show projected offset."
          />
          <MiniCard
            title="Save with Friends"
            body="Join circles and hit shared goals together with reminders and progress."
          />
        </div>

        {/* FAQ */}
        <FAQ />
      </div>
      <WalletStatus />
    </main>
  );
}

function ActionCard({
  title,
  icon,
  body,
  cta,
  content,
}: {
  title: string;
  icon?: React.ReactNode;
  body: string;
  cta: string;
  content: React.ReactNode;
}) {
  return (
    <div className="card p-5 sm:p-6 space-y-4">
      <div className="space-y-2 flex items-center gap-2">
        {icon}
        <div>
          <h2 className="text-xl font-semibold text-[#e8fdf4]">{title}</h2>
          <p className="text-sm text-[#bfe8d7]">{body}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>{content}</div>
        <div className="flex justify-end">
          <span className="badge">{cta}</span>
        </div>
      </div>
    </div>
  );
}

function MiniCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-4 flex flex-col gap-2">
      <h3 className="text-lg font-semibold text-[#e8fdf4]">{title}</h3>
      <p className="text-sm text-[#bfe8d7]">{body}</p>
    </div>
  );
}

function MoneyBoxCalculator() {
  const { address, isConnected, isConnecting } = useAccount();
  const { data: walletClient, isPending: walletClientPending } = useWalletClient();
  const chainId = useChainId();
  const { user: telegramUser } = useTelegram();
  const [amount, setAmount] = useReactState(2000);
  const [months, setMonths] = useReactState(6);
  const [apy, setApy] = useReactState<number | null>(null);
  const [loading, setLoading] = useReactState(false);
  const [withdrawing, setWithdrawing] = useReactState(false);
  const { show } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const rate = await fetchAaveApy();
        setApy(rate);
      } catch (e: any) {
        console.error("APY fetch failed", e);
        setApy(null);
      }
    })();
  }, []);

  const fallbackApy = 5;
  const effectiveApy =
    apy !== null && Number.isFinite(apy) && apy > 0 ? apy : fallbackApy;

  const monthlyRate = (effectiveApy / 100) / 12;
  const projectedYield = amount * monthlyRate * months;
  const monthlyContribution = amount / months;
  const totalWithYield = amount + projectedYield;

  const handleStartSaving = async () => {
    // Check connection state more thoroughly
    if (!isConnected || !address) {
      show("error", "Please connect your wallet first");
      return;
    }
    
    // Check if on correct network
    if (chainId !== sepolia.id) {
      show("error", "Please switch to Sepolia network in MetaMask");
      return;
    }
    
    if (!walletClient) {
      if (walletClientPending || isConnecting) {
        show("error", "Wallet is connecting, please wait...");
      } else {
        show("error", "Wallet not ready. Please refresh the page or reconnect your wallet.");
      }
      return;
    }
    
    try {
      setLoading(true);
      await supplyUsdc({ walletClient, amount, decimals: 6 });
      
      // Award gamification points
      if (telegramUser?.id) {
        const profile = await getOrCreateUserProfile(telegramUser.id, walletClient.account?.address);
        if (profile) {
          await awardPoints(profile.id, 'savings_goal', 50, { targetAmount: amount, months });
          await updateStreak(profile.id);
        }
      }
      
      show("success", "Supplied to Aave pool");
    } catch (e: any) {
      show("error", e?.shortMessage || e?.message || "Supply failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected || !address) {
      show("error", "Please connect your wallet first");
      return;
    }
    
    // Check if on correct network
    if (chainId !== sepolia.id) {
      show("error", "Please switch to Sepolia network in MetaMask");
      return;
    }
    
    if (!walletClient) {
      if (walletClientPending || isConnecting) {
        show("error", "Wallet is connecting, please wait...");
      } else {
        show("error", "Wallet not ready. Please refresh the page or reconnect your wallet.");
      }
      return;
    }
    try {
      setWithdrawing(true);
      await withdrawUsdc({ walletClient, amount, decimals: 6 });
      show("success", "Withdrawn from Aave pool");
    } catch (e: any) {
      show("error", e?.shortMessage || e?.message || "Withdraw failed");
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-4 text-sm text-[#bfe8d7]">
      <div className="flex items-center gap-2">
        <Target size={16} className="text-[#30f0a8]" /> Target savings toward your goal
      </div>
      <div className="grid gap-3">
        <div className="p-3 rounded-lg border border-[#1e2a24] bg-[rgba(48,240,168,0.06)]">
          <div className="flex justify-between items-center">
            <span>Target Amount</span>
            <span className="text-[#30f0a8] font-semibold">{amount.toLocaleString()} USDC</span>
          </div>
          <input
            type="range"
            min={100}
            max={10000}
            step={100}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-[#30f0a8]"
          />
        </div>
        <div className="p-3 rounded-lg border border-[#1e2a24] bg-[rgba(48,240,168,0.06)]">
          <div className="flex justify-between items-center">
            <span>Months</span>
            <span className="text-[#30f0a8] font-semibold">{months}</span>
          </div>
          <input
            type="range"
            min={2}
            max={24}
            step={1}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full accent-[#30f0a8]"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <Stat label="Monthly save" value={`${monthlyContribution.toFixed(2)} USDC`} />
        <Stat label="Projected yield" value={`${projectedYield.toFixed(2)} USDC`} />
        <Stat label="Total with yield" value={`${totalWithYield.toFixed(2)} USDC`} />
        <Stat label="APY (live)" value={`${effectiveApy.toFixed(2)}%`} />
      </div>
      <button
        className="btn-primary w-full text-center disabled:opacity-60"
        disabled={!isConnected || !walletClient || loading || walletClientPending}
        onClick={handleStartSaving}
      >
        {loading ? "Supplying..." : !walletClient ? "Preparing wallet..." : "Start Saving"}
      </button>
      <button
        className="btn-secondary w-full text-center disabled:opacity-60"
        disabled={!isConnected || !walletClient || withdrawing || walletClientPending}
        onClick={handleWithdraw}
      >
        {withdrawing ? "Withdrawing..." : !walletClient ? "Preparing wallet..." : "Withdraw"}
      </button>
      <p className="text-[11px] text-[#8da196]">
        APY fetched from Aave Sepolia pool. Estimates only; actual yield may vary. We’ll integrate periodic permissions for auto-pulls.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg border border-[#1e2a24] bg-[rgba(10,15,13,0.8)]">
      <p className="text-[#8da196]">{label}</p>
      <p className="text-[#e8fdf4] font-semibold">{value}</p>
    </div>
  );
}

