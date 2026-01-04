import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ActivityPage() {
    return (
        <div className="max-w-md mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 mb-6">
                <Link href="/" className="p-2 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition text-[#8da196]">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-[#e8fdf4]">Activity</h1>
            </div>
            <ActivityDashboard />
        </div>
    );
}
