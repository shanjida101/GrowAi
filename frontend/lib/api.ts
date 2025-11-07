// frontend/lib/api.ts
export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000").replace(/\/+$/, "");

type Json = Record<string, unknown> | unknown[];

async function request<T>(path: string, init?: RequestInit & { body?: Json | string }): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body:
      typeof init?.body === "string"
        ? init.body
        : init?.body !== undefined
        ? JSON.stringify(init.body)
        : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`[${res.status}] ${res.statusText}`);
  const txt = await res.text();
  return txt ? (JSON.parse(txt) as T) : (undefined as unknown as T);
}

export const api = {
  get:  <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: unknown) => request<T>(p, { method: "POST", body: body as any }),
  patch:<T>(p: string, body?: unknown) => request<T>(p, { method: "PATCH", body: body as any }),
  delete:<T>(p: string) => request<T>(p, { method: "DELETE" }),
};

export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p; } catch { return fallback; }
}
