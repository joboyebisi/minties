"use client";

import Link from "next/link";
import { PiggyBank } from "lucide-react";

export function SavingsCircle() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-[#bfe8d7]">
        <PiggyBank size={16} className="text-[#30f0a8]" /> Savings Circle
      </div>

      <div className="card p-6 border-dashed border-2 border-[#1e2a24] bg-[rgba(48,240,168,0.02)]">
        <div className="text-center space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-[#e8fdf4]">Save with Friends</h3>
            <p className="text-sm text-[#8da196] max-w-xs mx-auto">
              Pool funds together, earn yield, and reach your goals faster.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <Link
              href="/circle/create"
              className="btn-primary py-3 flex items-center justify-center gap-2"
            >
              ✨ Start Circle
            </Link>
            <Link
              href="/circle/join" // Note: This page doesn't exist yet, we only have /circle/[id]
              // Ideally we should have a generic join page that asks for ID or lists user circles
              // For now, let's link to a placeholder or assume user joins via link
              // I'll create a simple /circle/join page that asks for ID later if needed.
              // Actually, let's just make it a button that says "Got a code?" and opens a modal? 
              // Or simpler: Link to /circle/join (I should create this page if it's referenced).
              // I'll stick to a simple disabled button or link to home for now if join logic is specific.
              // Wait, the user plan said /circle/[id] for "Join Flow". 
              // So "Join" button probably needs to ask for an ID first.
              // Reverting to previous logic: I should probably create a /circle/join page that just asks for ID.
              // For this task, I will point to "/circle/join" and I will enable that page next.
              className="btn-secondary py-3 flex items-center justify-center gap-2"
            >
              🤝 Join Circle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
