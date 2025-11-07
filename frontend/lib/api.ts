// frontend/lib/api.ts
export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000").replace(/\/+$/, "");

type JsonLike = Record<string, unknown> | unknown[];

// Generic fetch with: timeout, smart headers, FormData support, better errors, 204 handling.
async function request<T>(
  path: string,
  init?: RequestInit & { body?: JsonLike | string | FormData }
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  // Build headers only when appropriate
  const headers = new Headers(init?.headers || {});
  const isFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const isStringBody = typeof init?.body === "string";
  const hasBody = init?.body !== undefined;

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Serialize body only if not FormData/string
  const body =
    isFormData ? (init!.body as FormData)
    : isStringBody ? (init!.body as string)
    : hasBody ? JSON.stringify(init!.body)
    : undefined;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers,
      body,
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  const text = await res.text();
  if (!res.ok) {
    // Try to surface API error details, if JSON-ish
    let detail = "";
    try {
      const j = text ? JSON.parse(text) : null;
      detail = j?.detail ?? j?.message ?? text ?? "";
    } catch {
      detail = text || "";
    }
    const msg = `[${res.status}] ${res.statusText}${detail ? ` — ${detail}` : ""}`;
    throw new Error(msg);
  }

  if (!text) return undefined as unknown as T;  // handles 204
  try {
    return JSON.parse(text) as T;
  } catch {
    // If server returns plain text
    return text as unknown as T;
  }
}

export const api = {
  get:   <T>(p: string) => request<T>(p),
  post:  <T>(p: string, body?: unknown) => request<T>(p, { method: "POST", body }),
  patch: <T>(p: string, body?: unknown) => request<T>(p, { method: "PATCH", body }),
  delete:<T>(p: string) => request<T>(p, { method: "DELETE" }),
};

// “Never crash UI” helper
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}
