import { fetcher } from "./fetcher";

export function get<T>(url: string) {
  return fetcher<T>(url, { method: "GET" });
}

export function post<T, B = unknown>(url: string, body?: B) {
  return fetcher<T>(url, { method: "POST", body: body ? JSON.stringify(body) : undefined });
}

export function put<T, B = unknown>(url: string, body?: B) {
  return fetcher<T>(url, { method: "PUT", body: body ? JSON.stringify(body) : undefined });
}

export function del<T>(url: string) {
  return fetcher<T>(url, { method: "DELETE" });
}
