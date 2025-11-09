import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { LeadInput, LeadRecord } from "@/types/leads";

const leadsPath = path.join(process.cwd(), "data", "leads.json");

async function readLeads() {
  try {
    const file = await fs.readFile(leadsPath, "utf-8");
    return JSON.parse(file) as LeadRecord[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function addLead(input: LeadInput) {
  const leads = await readLeads();
  const record: LeadRecord = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  leads.unshift(record);
  await fs.writeFile(leadsPath, JSON.stringify(leads, null, 2), "utf-8");
  return record;
}

export async function listLeads() {
  return readLeads();
}
