import { api } from "./api";

export async function login(email: string, password: string) {
  return api.post("/auth/login", { email, password });
}

export async function logout() {
  return api.post("/auth/logout");
}

export async function getSession() {
  return api.get("/auth/me");
}
