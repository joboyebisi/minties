"use client";

import Link from "next/link";
import Image from "next/image";
import { Wallet, Gift, PiggyBank } from "lucide-react";

export function NavBar() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[rgba(5,9,8,0.7)] border-b border-[rgba(48,240,168,0.12)]">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-[rgba(48,240,168,0.12)] border border-[rgba(48,240,168,0.35)] flex items-center justify-center overflow-hidden p-1.5">
              <Image
                src="/minties-log.svg"
                alt="Minties logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-sm text-[#bfe8d7]">Minties</p>
              <p className="text-[10px] text-[#8da196]">Telegram Mini App</p>
            </div>
          </Link>
        </div>
        <nav className="flex items-center gap-3 text-sm text-[#bfe8d7]">
          <Link
            href="/#moneybox"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full hover:bg-[rgba(48,240,168,0.08)] transition"
          >
            <PiggyBank size={16} className="text-[#30f0a8]" /> Money Box
          </Link>
          <Link
            href="/#gifts"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full hover:bg-[rgba(48,240,168,0.08)] transition"
          >
            <Gift size={16} className="text-[#30f0a8]" /> Gifts
          </Link>
          <Link
            href="/connect"
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full hover:bg-[rgba(48,240,168,0.08)] transition"
          >
            <Wallet size={16} className="text-[#30f0a8]" /> Wallet
          </Link>
        </nav>
      </div>
    </header>
  );
}

