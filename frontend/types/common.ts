export type Role = "admin" | "finance" | "operations" | "hr" | "viewer";

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface Session {
  user: User;
  token?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
