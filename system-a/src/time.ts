const tokyoFormatter = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false
});

export function formatDateTime(value: unknown): string {
  if (value instanceof Date) {
    return `${tokyoFormatter.format(value).replace(" ", "T")}+09:00`;
  }

  const text = String(value);
  if (text.includes("T")) {
    return text.endsWith("+09:00") ? text : `${text.slice(0, 19)}+09:00`;
  }

  return `${text.replace(" ", "T").slice(0, 19)}+09:00`;
}

export function formatDate(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return tokyoFormatter.format(value).slice(0, 10);
  }

  return String(value).slice(0, 10);
}
