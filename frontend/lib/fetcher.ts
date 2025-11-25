export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetcher<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
