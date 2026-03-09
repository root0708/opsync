import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getStorage() {
  if (typeof document === "undefined") return typeof localStorage !== "undefined" ? localStorage : undefined;
  const remember = document.cookie.includes("opsync_remember_me=1");
  return remember ? window.localStorage : window.sessionStorage;
}

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: { storage: getStorage() },
  });
}
