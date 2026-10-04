import { env, isApiConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Human readable copy for every status the backend can return. */
export function friendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 0:
        return "We couldn't reach Path Pointer. Check your connection and try again.";
      case 400:
        return error.message || "That request wasn't valid. Please review the fields and retry.";
      case 401:
        return "Your session expired. Please sign in again.";
      case 403:
        return "You don't have access to this resource.";
      case 404:
        return "We couldn't find what you were looking for.";
      case 409:
        return error.message || "Problem already marked as solved.";
      case 422:
        return error.message || "Some values weren't accepted. Please review your input.";
      case 429:
        return "Too many requests. Please slow down for a moment.";
      default:
        return error.status >= 500
          ? "Something went wrong on our side. Please try again shortly."
          : error.message || "Unexpected error.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

async function authHeader(): Promise<Record<string, string>> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return {};
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const base = env.apiBaseUrl ?? "";
  const url = new URL(
    `${base}${path.startsWith("/") ? path : `/${path}`}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

/**
 * Convert camelCase keys to snake_case recursively.
 * Handles objects, arrays, and primitives.
 * @param obj - The object/array/value to normalize
 * @returns Normalized object/array/value with snake_case keys
 */
function normalizeKeysToSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(normalizeKeysToSnakeCase);
  }

  if (typeof obj !== "object") {
    return obj;
  }

  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    normalized[snakeKey] = normalizeKeysToSnakeCase(value);
  }
  return normalized;
}

/**
 * Single entry point for every backend call.
 * Components must never call fetch() directly.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!isApiConfigured) {
    throw new ApiError(0, "Backend base URL (VITE_API_BASE_URL) is not configured.");
  }

  const { method = "GET", body, query, signal } = options;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      signal,
      credentials: "omit",
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(await authHeader()),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new ApiError(0, "Network request failed.", "network_error", networkError);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const p = (payload ?? {}) as { message?: string; error?: string; code?: string };
    if (response.status === 401) onUnauthorized?.();
    throw new ApiError(
      response.status,
      p.message ?? p.error ?? `Request failed with status ${response.status}`,
      p.code,
      payload,
    );
  }

  // Support both `{ data: ... }` envelopes and bare payloads.
  let result = payload;
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    result = (payload as { data: T }).data;
  }

  // Normalize camelCase keys to snake_case for consistent frontend types
  return normalizeKeysToSnakeCase(result) as T;
}
