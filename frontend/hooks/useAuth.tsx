"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, login, logout } from "@/lib/auth";
import type { LoginPayload, Session } from "@/types/common";

const SESSION_KEY = ["session"];

export function useSession() {
  return useQuery<Session>({ queryKey: SESSION_KEY, queryFn: getSession, retry: false });
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionQuery = useSession();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
      router.push("/");
    }
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: SESSION_KEY });
      router.push("/(auth)/login");
    }
  });

  return {
    session: sessionQuery.data,
    isLoading: sessionQuery.isLoading || loginMutation.isPending,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    error: loginMutation.error || sessionQuery.error
  };
}
