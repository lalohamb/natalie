import "server-only";

import path from "node:path";
import fs from "node:fs/promises";
import { STORAGE_DIR, writeFileAtomic } from "./storage";

const SETTINGS_PATH = path.join(STORAGE_DIR, "stripe-settings.json");

type StripeSettings = { paymentLinkUrl?: string };

async function read(): Promise<StripeSettings> {
  try {
    return JSON.parse(await fs.readFile(SETTINGS_PATH, "utf8")) as StripeSettings;
  } catch {
    return {};
  }
}

export async function getPaymentLinkUrl(): Promise<string | null> {
  "use cache";
  const settings = await read();
  return settings.paymentLinkUrl ?? null;
}

export async function savePaymentLinkUrl(url: string): Promise<void> {
  const settings = await read();
  settings.paymentLinkUrl = url;
  await writeFileAtomic(SETTINGS_PATH, JSON.stringify(settings, null, 2));
}
