"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

const REMEMBER_COOKIE = "opsync_remember_me";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    document.cookie = `${REMEMBER_COOKIE}=${rememberMe ? "1" : "0"}; path=/${rememberMe ? "; max-age=31536000" : ""}`;
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main style={{ maxWidth: 400, margin: "4rem auto", padding: "2rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>OPSYNC</h1>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", fontWeight: 400 }}>
        Sign in
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "0.5rem", fontSize: "1rem" }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ width: "1rem", height: "1rem" }}
          />
          Remember me
        </label>
        {error && <p style={{ color: "crimson", fontSize: "0.9rem" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
        No account? <Link href="/signup">Sign up</Link>
      </p>
      <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
        <Link href="/forgot-password">Forgot password?</Link>
      </p>
    </main>
  );
}
