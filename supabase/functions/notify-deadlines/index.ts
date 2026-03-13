import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    // Allow manual trigger via GET + scheduled via cron
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all non-expired opportunities with deadlines in 1, 3, or 7 days
    const targetDays = [1, 3, 7];
    let totalNotifications = 0;

    for (const daysLeft of targetDays) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysLeft);
      const dateStr = targetDate.toISOString().split("T")[0];

      // Fetch all opportunities with this deadline
      const { data: opportunities, error: oppError } = await supabase
        .from("opportunities")
        .select("id, user_id, company, role, type, deadline")
        .eq("deadline", dateStr)
        .eq("is_applied", false);

      if (oppError) {
        console.error(`Error fetching opportunities for ${dateStr}:`, oppError);
        continue;
      }

      if (!opportunities || opportunities.length === 0) continue;

      for (const opp of opportunities) {
        // Check if a notification was already sent for this opp + days combo today
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", opp.user_id)
          .eq("type", "deadline")
          .like("message", `%${opp.id}%`)
          .gte("created_at", today.toISOString())
          .single();

        if (existing) continue; // Already notified today

        // Determine urgency label
        const urgencyLabel =
          daysLeft === 1
            ? "⚠️ URGENT — Deadline Tomorrow!"
            : daysLeft === 3
            ? "⏳ Deadline in 3 Days"
            : "📅 Deadline in 1 Week";

        const typeEmoji =
          opp.type === "Internship"
            ? "💼"
            : opp.type === "Hackathon"
            ? "🏆"
            : opp.type === "Scholarship"
            ? "🎓"
            : "📋";

        // Insert notification
        const { error: insertError } = await supabase
          .from("notifications")
          .insert({
            user_id: opp.user_id,
            type: "deadline",
            title: `${urgencyLabel}`,
            message: `${typeEmoji} ${opp.company} — ${opp.role} | Deadline: ${opp.deadline} | oppId:${opp.id}`,
            is_read: false,
            link: "/dashboard",
          });

        if (insertError) {
          console.error(`Error inserting notification for opp ${opp.id}:`, insertError);
        } else {
          totalNotifications++;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Deadline check complete. ${totalNotifications} notifications sent.`,
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
