"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Money Box and how does the yield work?",
    a: "Money Box lets you set a USDC target (for example 2,000 over 6 months). We split it into recurring contributions and optionally supply your balance to Aave v3 (Sepolia) to earn yield. We fetch APY from Aave when possible and fall back to a conservative default so projections stay realistic. You stay in control and can withdraw back to your wallet at any time.",
  },
  {
    q: "Can I save with friends in a circle?",
    a: "Yes. Start a savings circle to get a unique Circle ID and share it in your Telegram chats. Friends join by pasting the ID and choosing their contribution. Over time everyone's deposits and progress are tracked against the shared target, so you can hit travel, rent, or group purchase goals together.",
  },
  {
    q: "How do gifts work on Minties?",
    a: "You choose an amount of USDC and a recipient, we create a claimable gift that can be shared as a link in Telegram. The recipient opens the link, connects a wallet (MetaMask), and claims the funds. The same interface is used later for recurring or scheduled gifting, like monthly support or birthdays.",
  },
  {
    q: "What's the difference between one-time and recurring transfers?",
    a: "One-time gifts move USDC once, immediately after you confirm. Recurring transfers are scheduled payments (for remittances, charity, tithes, or payroll‑like flows). These use MetaMask Advanced Permissions (ERC-7715) so that after you approve a limit (for example 10 USDC per week), Minties can execute each period automatically without asking you to sign every single time.",
  },
  {
    q: "Is my USDC safe? Are funds custodial or non-custodial?",
    a: "Minties is fully non-custodial. Your USDC never leaves your wallet or smart account until you explicitly approve a transaction. When you use Money Box with Aave, funds are supplied to Aave v3's audited smart contracts—you maintain ownership and can withdraw anytime. Gift escrows use simple, transparent Solidity contracts on Ethereum Sepolia. You can always track activity on-chain and revoke permissions from your MetaMask wallet.",
  },
  {
    q: "How do smart contracts work for savings circles and gifts?",
    a: "Savings circles use a SavingsCircle.sol contract that locks contributions until the group target is met. Gifts use GiftEscrow.sol that holds USDC until claimed. Both contracts are deployed on Ethereum Sepolia (testnet) and are open-source. You can verify transactions on Etherscan. The contracts enforce rules like minimum contributions, lock periods, and yield distribution transparently on-chain.",
  },
  {
    q: "What is MetaMask Advanced Permissions and how does it work?",
    a: "Advanced Permissions (ERC-7715) let you grant Minties fine-grained, time-limited permissions to execute transactions on your behalf. For example, you can approve '10 USDC per week for 4 weeks' for recurring remittances. Once granted, Minties can execute those transfers automatically without requiring your signature each time. You can revoke permissions anytime from MetaMask, and all activity is visible on-chain.",
  },
  {
    q: "How does yield from Aave work?",
    a: "Aave v3 is a decentralized lending protocol. When you supply USDC to Aave, you receive aTokens (aUSDC) representing your deposit plus accrued interest. The APY fluctuates based on supply/demand in the Aave pool. Minties fetches the current APY from Aave's on-chain data and shows projected yield. Actual yield may vary. You can withdraw your principal plus earned interest anytime by calling Aave's withdraw function.",
  },
  {
    q: "Do I need to install anything special in Telegram?",
    a: "No extra app is needed. Minties runs as a Telegram Mini App that opens inside your chat. You tap the Minties bot, launch the Mini App, and the interface adapts to Telegram's viewport with big tap targets, emojis, and copy tuned for mobile users.",
  },
  {
    q: "Who pays gas fees and on which networks does Minties run?",
    a: "Currently, transactions run on Ethereum Sepolia (testnet) for testing, and you pay normal gas fees from your wallet when you confirm. As we add account abstraction and paymaster support, some flows (like small recurring transfers) can become partly or fully gas‑sponsored. Mainnet deployment will follow after thorough testing.",
  },
  {
    q: "What happens if I lose access to my wallet?",
    a: "Since Minties is non-custodial, wallet recovery depends on your MetaMask seed phrase or account backup. We don't store your private keys. If you lose access, you'll need to restore your wallet using your seed phrase. For smart accounts, recovery depends on your account type—Hybrid accounts can use passkeys or EOA signers. Always back up your seed phrase securely.",
  },
  {
    q: "How do invites and social sharing work?",
    a: "You get a unique invite code when you join Minties. Share it with friends via Telegram. When someone uses your code, you both earn points and badges. The invite system tracks referrals and rewards early adopters. You can also share gift links, circle IDs, and savings goal progress directly in Telegram chats using native sharing buttons.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="card p-5 sm:p-6 space-y-3">
      <h2 className="text-xl font-semibold text-[#e8fdf4]">FAQ</h2>
      <div className="space-y-2">
        {faqs.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <div
              key={idx}
              className="border border-[#1e2a24] rounded-xl bg-[rgba(10,15,13,0.75)]"
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm text-[#e8fdf4]"
                onClick={() => setOpen(isOpen ? null : idx)}
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#30f0a8] transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 text-xs text-[#bfe8d7]">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

