"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

type List = { id: string; name: string; status: string; total_count: number; ready_count: number; created_at: string };

export default function DataPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
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
      fetch("/api/v1/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((u) => setUser(u))
        .catch(() => router.replace("/login"));
    });
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      fetch("/api/v1/lists", { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => (r.ok ? r.json() : []))
        .then(setLists)
        .finally(() => setLoading(false));
    });
  }, [user]);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile || !uploadName.trim()) {
      setError("Name and file required");
      return;
    }
    setError("");
    setUploading(true);
    const csv = await uploadFile.text();
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    try {
      const res = await fetch("/api/v1/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: uploadName.trim(), csv }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.error || `Upload failed (${res.status})`;
        const hint = data.hint ? ` — ${data.hint}` : "";
        throw new Error(msg + hint);
      }
      setLists((prev) => [{ ...data, created_at: new Date().toISOString() }, ...prev]);
      setUploadName("");
      setUploadFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!user) return <p style={{ padding: "2rem" }}>Loading...</p>;

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "2rem", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Data Layer</h1>
        <Link href="/dashboard" style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}>
          ← Dashboard
        </Link>
      </div>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Upload CSV → DNC check → Duplicate check → List ready
      </p>

      <section style={{ background: "#f8f9fa", padding: "1.5rem", borderRadius: 8, marginBottom: "2rem" }}>
        <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem" }}>Upload CSV</h2>
        <form onSubmit={handleUpload} style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#666", marginBottom: 4 }}>List name</label>
            <input
              type="text"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="e.g. March leads"
              style={{ padding: "0.5rem 0.75rem", width: 180, border: "1px solid #ccc", borderRadius: 4 }}
              disabled={uploading}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#666", marginBottom: 4 }}>CSV file</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              style={{ padding: "0.5rem" }}
              disabled={uploading}
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !uploadFile || !uploadName.trim()}
            style={{
              padding: "0.5rem 1.25rem",
              background: uploading ? "#ccc" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            {uploading ? "Processing…" : "Upload"}
          </button>
        </form>
        {error && <p style={{ color: "#dc2626", marginTop: "0.75rem", fontSize: "0.9rem" }}>{error}</p>}
        <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.75rem", marginBottom: 0 }}>
          CSV should have columns: address, city, state, zip, owner name, phone, email (headers are flexible)
        </p>
      </section>

      <section>
        <h2 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Your lists</h2>
        {loading ? (
          <p style={{ color: "#666" }}>Loading…</p>
        ) : lists.length === 0 ? (
          <p style={{ color: "#666" }}>No lists yet. Upload a CSV to get started.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {lists.map((list) => (
              <Link
                key={list.id}
                href={`/data/lists/${list.id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 6,
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div>
                  <strong>{list.name}</strong>
                  <span style={{ marginLeft: "0.75rem", fontSize: "0.85rem", color: "#666" }}>
                    {list.ready_count} / {list.total_count} ready
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    padding: "0.2rem 0.5rem",
                    borderRadius: 4,
                    background: list.status === "list_ready" ? "#dcfce7" : list.status === "error" ? "#fee2e2" : "#fef3c7",
                    color: list.status === "list_ready" ? "#166534" : list.status === "error" ? "#991b1b" : "#92400e",
                  }}
                >
                  {list.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
