"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
      else router.replace("/login");
    });
  }, [router]);

  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <p>Redirecting...</p>
    </main>
  );
}
