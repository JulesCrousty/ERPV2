export async function apiRequest(method: string, url: string, body?: unknown, options: RequestInit = {}) {
  const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "") + url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message || "API error");
  }

  return (await res.json()) as unknown;
}

export const api = {
  get: (url: string, options?: RequestInit) => apiRequest("GET", url, null, options),
  post: (url: string, body?: unknown, options?: RequestInit) => apiRequest("POST", url, body, options),
  put: (url: string, body?: unknown, options?: RequestInit) => apiRequest("PUT", url, body, options),
  delete: (url: string, options?: RequestInit) => apiRequest("DELETE", url, null, options)
};
