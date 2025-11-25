import { get, post } from "./api";
import { Session, LoginPayload } from "@/types/common";

export async function login(payload: LoginPayload) {
  return post<Session, LoginPayload>("/auth/login", payload);
}

export async function logout() {
  return post<void>("/auth/logout");
}

export async function getSession() {
  return get<Session>("/auth/session");
}
