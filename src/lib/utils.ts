import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sri Lankan numbers are stored E.164 (+94771234567) and displayed local
 * (077 123 4567), which is how people here read and dial them.
 */
export function formatPhoneLocal(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  const local = digits.startsWith("94") ? `0${digits.slice(2)}` : digits;
  if (local.length === 10) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return local;
}

/** tel: hrefs must stay E.164 so the dialler works from any network. */
export function toE164(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("94")) return `+${digits}`;
  if (digits.startsWith("0")) return `+94${digits.slice(1)}`;
  if (digits.length === 9) return `+94${digits}`;
  return `+${digits}`;
}

/** wa.me wants digits with no plus. */
export function toWhatsappNumber(input: string): string {
  return toE164(input).replace(/\D/g, "");
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** "2 days ago", "3 weeks ago" — used on sold cards and the admin inbox. */
export function timeAgo(date: Date | string): string {
  const then = new Date(date).getTime();
  const seconds = Math.floor((Date.now() - then) / 1000);
  const units: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, label] of units) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n} ${label}${n > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Turn a Mongoose doc tree into plain JSON safe to cross the RSC boundary. */
export function plain<T>(doc: unknown): T {
  return JSON.parse(JSON.stringify(doc)) as T;
}
