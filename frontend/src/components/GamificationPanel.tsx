"use client";

import { useEffect, useState } from "react";
import { Trophy, Award, Flame, Users, Gift, Target } from "lucide-react";
import { useTelegram } from "@/hooks/useTelegram";
import { getUserProfile, getUserBadges, updateStreak, Badge } from "@/lib/gamification";

export function GamificationPanel() {
  const { user, isTelegram } = useTelegram();
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isTelegram || !user?.id) return;
    loadProfile();
  }, [isTelegram, user]);

  async function loadProfile() {
    if (!user?.id) return;
    try {
      setLoading(true);
      const profile = await getUserProfile(user.id.toString());
      if (profile) {
        setPoints(profile.points);
        setLevel(profile.level);
        setStreak(profile.streak_days);
        const userBadges = await getUserBadges(user.id.toString());
        setBadges(userBadges);
        // Update streak on load
        await updateStreak(user.id.toString());
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  }

  if (!isTelegram || loading) return null;

  const levelProgress = (points % 1000) / 10; // Progress to next level

  return (
    <div className="card p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Trophy size={18} className="text-[#30f0a8]" />
        <h3 className="text-lg font-semibold text-[#e8fdf4]">Your Progress</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
          <p className="text-xs text-[#8da196]">Points</p>
          <p className="text-lg font-semibold text-[#30f0a8]">{points.toLocaleString()}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
          <p className="text-xs text-[#8da196]">Level</p>
          <p className="text-lg font-semibold text-[#30f0a8]">{level}</p>
        </div>
        <div className="text-center p-3 rounded-lg bg-[rgba(48,240,168,0.08)] border border-[#1e2a24]">
          <p className="text-xs text-[#8da196] flex items-center justify-center gap-1">
            <Flame size={12} className="text-[#30f0a8]" /> Streak
          </p>
          <p className="text-lg font-semibold text-[#30f0a8]">{streak} days</p>
        </div>
      </div>

      {levelProgress > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-[#8da196]">
            <span>Progress to Level {level + 1}</span>
            <span>{levelProgress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-[rgba(10,15,13,0.8)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#30f0a8] transition-all"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>
      )}

      {badges.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#30f0a8]" />
            <p className="text-sm font-semibold text-[#e8fdf4]">Badges ({badges.length})</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className="px-2 py-1 rounded-full bg-[rgba(48,240,168,0.12)] border border-[rgba(48,240,168,0.35)] text-xs text-[#30f0a8]"
              >
                {badge.badge_type.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

