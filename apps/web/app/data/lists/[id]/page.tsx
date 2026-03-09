"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

type Lead = {
  id: string;
  row_index: number;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  owner_name: string | null;
  phone: string | null;
  email: string | null;
  status: string;
  dnc_status: string | null;
  is_duplicate: boolean;
};

type List = {
  id: string;
  name: string;
  status: string;
  total_count: number;
  ready_count: number;
};

export default function ListDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [list, setList] = useState<List | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "ready" | "dnc" | "duplicate">("all");
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
        return;
      }
      const token = session.access_token;
      Promise.all([
        fetch(`/api/v1/lists/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/v1/lists/${id}/leads`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
        .then(([r1, r2]) => Promise.all([r1.json(), r2.json()]))
        .then(([listData, leadsData]) => {
          if (listData.error) {
            router.replace("/data");
            return;
          }
          setList(listData);
          setLeads(leadsData);
        })
        .finally(() => setLoading(false));
    });
  }, [id, router]);

  const filtered =
    filter === "all"
      ? leads
      : filter === "ready"
        ? leads.filter((l) => l.status === "list_ready")
        : filter === "dnc"
          ? leads.filter((l) => l.status === "dnc")
          : leads.filter((l) => l.status === "duplicate");

  if (!list && !loading) return null;
  if (loading) return <p style={{ padding: "2rem" }}>Loading…</p>;

  return (
    <main style={{ maxWidth: 1000, margin: "2rem auto", padding: "2rem", fontFamily: "system-ui" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/data" style={{ color: "#666", textDecoration: "none", fontSize: "0.9rem" }}>
          ← Back to Data
        </Link>
      </div>
      <h1 style={{ marginBottom: "0.25rem" }}>{list!.name}</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        {list!.ready_count} list ready · {leads.filter((l) => l.status === "dnc").length} DNC ·{" "}
        {leads.filter((l) => l.status === "duplicate").length} duplicates
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {(["all", "ready", "dnc", "duplicate"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "0.4rem 0.8rem",
              border: `1px solid ${filter === f ? "#2563eb" : "#e5e7eb"}`,
              background: filter === f ? "#eff6ff" : "#fff",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {f === "all" ? "All" : f === "ready" ? "List ready" : f === "dnc" ? "DNC" : "Duplicates"}
          </button>
        ))}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
              <th style={{ padding: "0.6rem", borderBottom: "1px solid #e5e7eb" }}>#</th>
              <th style={{ padding: "0.6rem", borderBottom: "1px solid #e5e7eb" }}>Address</th>
              <th style={{ padding: "0.6rem", borderBottom: "1px solid #e5e7eb" }}>Owner</th>
              <th style={{ padding: "0.6rem", borderBottom: "1px solid #e5e7eb" }}>Phone</th>
              <th style={{ padding: "0.6rem", borderBottom: "1px solid #e5e7eb" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "0.6rem" }}>{lead.row_index}</td>
                <td style={{ padding: "0.6rem" }}>
                  {[lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(", ") || "—"}
                </td>
                <td style={{ padding: "0.6rem" }}>{lead.owner_name || "—"}</td>
                <td style={{ padding: "0.6rem" }}>{lead.phone || "—"}</td>
                <td style={{ padding: "0.6rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.15rem 0.4rem",
                      borderRadius: 4,
                      background:
                        lead.status === "list_ready"
                          ? "#dcfce7"
                          : lead.status === "dnc"
                            ? "#fee2e2"
                            : "#fef3c7",
                      color:
                        lead.status === "list_ready"
                          ? "#166534"
                          : lead.status === "dnc"
                            ? "#991b1b"
                            : "#92400e",
                    }}
                  >
                    {lead.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <p style={{ color: "#666", marginTop: "1rem" }}>No leads match this filter.</p>}
    </main>
  );
}
