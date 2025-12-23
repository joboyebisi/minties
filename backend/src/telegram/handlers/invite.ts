import TelegramBot from "node-telegram-bot-api";
import { supabase } from "../../lib/supabase.js";

export function handleInviteCommands(bot: TelegramBot) {
  return async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const userId = msg.from?.id;
    const text = msg.text || "";

    if (!userId) {
      await bot.sendMessage(chatId, "❌ Unable to identify user.");
      return;
    }

    const args = text.split(" ").slice(1);

    if (args[0] === "code" || args[0] === "get") {
      // Get or create invite code
      if (!supabase) {
        await bot.sendMessage(chatId, "❌ Database not configured.");
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("telegram_user_id", userId)
        .single();

      if (!profile) {
        await bot.sendMessage(chatId, "❌ Please start using the Mini App first to create your profile.");
        return;
      }

      // Check for existing unused invite
      const { data: existing } = await supabase
        .from("invites")
        .select("invite_code")
        .eq("inviter_id", profile.id)
        .eq("used", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        await bot.sendMessage(
          chatId,
          `🎁 Your invite code:\n\n\`${existing.invite_code}\`\n\nShare this code with friends! When they use it, you both earn points.`,
          { parse_mode: "Markdown" }
        );
        return;
      }

      // Create new invite code
      const inviteCode = `MINT${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await supabase.from("invites").insert({
        inviter_id: profile.id,
        invite_code: inviteCode,
      });

      await bot.sendMessage(
        chatId,
        `🎁 Your invite code:\n\n\`${inviteCode}\`\n\nShare this code with friends! When they use it, you both earn points.`,
        { parse_mode: "Markdown" }
      );
    } else if (args[0] === "use" && args[1]) {
      // Use invite code
      const inviteCode = args[1].toUpperCase();
      if (!supabase) {
        await bot.sendMessage(chatId, "❌ Database not configured.");
        return;
      }

      // Get or create user profile
      let { data: profile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("telegram_user_id", userId)
        .single();

      if (!profile) {
        const { data: newProfile } = await supabase
          .from("user_profiles")
          .insert({
            telegram_user_id: userId,
            points: 0,
            level: 1,
            streak_days: 0,
          })
          .select()
          .single();
        profile = newProfile;
      }

      if (!profile) {
        await bot.sendMessage(chatId, "❌ Failed to create profile.");
        return;
      }

      // Check invite
      const { data: invite } = await supabase
        .from("invites")
        .select("*")
        .eq("invite_code", inviteCode)
        .eq("used", false)
        .single();

      if (!invite) {
        await bot.sendMessage(chatId, "❌ Invalid or already used invite code.");
        return;
      }

      // Mark as used
      await supabase
        .from("invites")
        .update({
          used: true,
          used_at: new Date().toISOString(),
          invitee_telegram_id: userId,
        })
        .eq("id", invite.id);

      // Award points to both users
      await supabase.rpc("increment_points", {
        user_id_param: invite.inviter_id,
        points_param: 50,
      });
      await supabase.rpc("increment_points", {
        user_id_param: profile.id,
        points_param: 50,
      });

      await bot.sendMessage(
        chatId,
        `✅ Invite code used! You and your inviter both earned 50 points. 🎉`
      );
    } else {
      await bot.sendMessage(
        chatId,
        `📖 Invite Commands:\n\n/invite code - Get your invite code\n/invite use <code> - Use someone's invite code\n\nEarn points by inviting friends!`
      );
    }
  };
}

