"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      const token = session.access_token;
      fetch("/api/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Unauthorized"))))
        .then((data) => setUser(data))
        .catch(() => setError("Failed to load user"));
    });
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (error) return <p style={{ padding: "2rem" }}>{error}</p>;
  if (!user) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <main style={{ maxWidth: 800, margin: "4rem auto", padding: "2rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Dashboard</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Signed in as {user.email}
      </p>
      <p style={{ marginBottom: "1rem" }}>
        OPSYNC foundation is live. Data layer: CSV upload, DNC check, list ready.
      </p>
      <Link
        href="/data"
        style={{
          display: "inline-block",
          padding: "0.5rem 1rem",
          background: "#2563eb",
          color: "white",
          textDecoration: "none",
          borderRadius: 4,
          marginRight: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        Open Data Layer →
      </Link>
      <button
        onClick={handleSignOut}
        style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
      >
        Sign out
      </button>
    </main>
  );
}
