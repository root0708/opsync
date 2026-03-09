import { Router, Request, Response } from "express";
import { parse } from "csv-parse/sync";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

type ReqWithUser = Request & { user: User };

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const uploadSchema = z.object({
  name: z.string().min(1).max(200),
  csv: z.string().min(1),
});

const COLUMN_MAP: Record<string, string> = {
  address: "address",
  "property address": "address",
  "mailing address": "address",
  city: "city",
  state: "state",
  "st": "state",
  zip: "zip",
  "zip code": "zip",
  "postal code": "zip",
  "owner name": "owner_name",
  "owner": "owner_name",
  "owner_name": "owner_name",
  phone: "phone",
  "phone number": "phone",
  "cell": "phone",
  "mobile": "phone",
  email: "email",
  "email address": "email",
};

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").slice(-10) || "";
}

function mapRow(headers: string[], row: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((h, i) => {
    const key = COLUMN_MAP[h.toLowerCase().trim()] || h.toLowerCase().replace(/\s/g, "_");
    out[key] = row[i]?.trim() ?? "";
  });
  return out;
}

export const listsRouter = Router();

listsRouter.get("/", async (req: Request, res: Response) => {
  const { user } = req as ReqWithUser;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data, error } = await supabase
    .from("lists")
    .select("id, name, status, total_count, ready_count, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

listsRouter.get("/:id", async (req: Request, res: Response) => {
  const { user } = req as ReqWithUser;
  const { id } = req.params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: list, error: listErr } = await supabase
    .from("lists")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (listErr || !list) {
    res.status(404).json({ error: "List not found" });
    return;
  }
  res.json(list);
});

listsRouter.get("/:id/leads", async (req: Request, res: Response) => {
  const { user } = req as ReqWithUser;
  const { id } = req.params;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: list } = await supabase
    .from("lists")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!list) {
    res.status(404).json({ error: "List not found" });
    return;
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("list_id", id)
    .order("row_index");

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

listsRouter.post("/", async (req: Request, res: Response) => {
  const { user } = req as ReqWithUser;
  const parsed = uploadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });
    return;
  }
  const { name, csv } = parsed.data;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let records: string[][];
  try {
    records = parse(csv, { skip_empty_lines: true, relax_column_count: true });
  } catch (e) {
    res.status(400).json({ error: "Invalid CSV" });
    return;
  }
  if (records.length < 2) {
    res.status(400).json({ error: "CSV must have header + at least one row" });
    return;
  }

  const headers = records[0].map((h) => String(h || "").trim());
  const rows = records.slice(1);

  const { data: list, error: listErr } = await supabase
    .from("lists")
    .insert({ user_id: user.id, name, status: "processing", total_count: rows.length })
    .select("id")
    .single();

  if (listErr || !list) {
    res.status(500).json({ error: listErr?.message ?? "Failed to create list" });
    return;
  }

  const dncResult = await supabase
    .from("dnc_registry")
    .select("phone")
    .eq("user_id", user.id);
  const dncPhones = new Set((dncResult.data ?? []).map((r) => normalizePhone(r.phone)));

  const seenPhones = new Map<string, number>();
  const leads: Array<Record<string, unknown>> = [];

  for (let i = 0; i < rows.length; i++) {
    const mapped = mapRow(headers, rows[i]);
    const phone = normalizePhone(mapped.phone || "");
    const isDnc = phone && dncPhones.has(phone);
    const dupIdx = phone ? seenPhones.get(phone) : undefined;
    const isDup = dupIdx !== undefined;
    if (phone) seenPhones.set(phone, i);

    let status = "raw";
    let dncStatus: string | null = null;
    if (isDnc) {
      status = "dnc";
      dncStatus = "internal_registry";
    } else if (isDup) {
      status = "duplicate";
    } else {
      status = "list_ready";
    }

    leads.push({
      list_id: list.id,
      row_index: i + 1,
      address: mapped.address || null,
      city: mapped.city || null,
      state: mapped.state || null,
      zip: mapped.zip || null,
      owner_name: mapped.owner_name || null,
      phone: mapped.phone || null,
      email: mapped.email || null,
      raw_data: mapped,
      status,
      dnc_status: dncStatus,
      is_duplicate: isDup,
    });
  }

  const readyCount = leads.filter((l) => l.status === "list_ready").length;

  const { error: leadsErr } = await supabase.from("leads").insert(leads);
  if (leadsErr) {
    await supabase.from("lists").update({ status: "error", error_message: leadsErr.message }).eq("id", list.id);
    res.status(500).json({ error: "Failed to save leads" });
    return;
  }

  await supabase
    .from("lists")
    .update({ status: "list_ready", ready_count: readyCount })
    .eq("id", list.id);

  res.status(201).json({ id: list.id, name, total_count: rows.length, ready_count: readyCount, status: "list_ready" });
});
