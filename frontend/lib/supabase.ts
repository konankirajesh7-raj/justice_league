import { createBrowserClient } from "@supabase/ssr";

// Use a lazy singleton so the client is only created when actually needed
// This prevents Next.js from crashing during static prerender analysis
let _supabase: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseClient() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      // During build-time prerender without env vars, return a stub that
      // won't get called because the component renders on the client
      throw new Error("Supabase env vars not configured");
    }
    _supabase = createBrowserClient(url, key);
  }
  return _supabase;
}

// Proxy that lazily initialises the real client on first method call
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
