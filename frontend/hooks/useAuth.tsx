"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, login, logout } from "@/lib/auth";
import { useEffect } from "react";

const SESSION_KEY = ["session"];

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: session,
    isLoading,
    refetch,
    error
  } = useQuery({
    queryKey: SESSION_KEY,
    queryFn: getSession,
    retry: false
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: async () => {
      await refetch();
      router.push("/");
    }
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: SESSION_KEY });
      router.push("/(auth)/login");
    }
  });

  return {
    session,
    loading: isLoading,
    isAuthenticated: !!session?.user,
    role: session?.user?.role,
    refreshSession: refetch,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    authError: error || loginMutation.error
  };
}

export function useProtectedRoute(allowedRoles?: string[]) {
  const router = useRouter();
  const { isAuthenticated, loading, role } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/(auth)/login");
    }

    if (!loading && allowedRoles && isAuthenticated && role && !allowedRoles.includes(role)) {
      router.replace("/unauthorized");
    }
  }, [allowedRoles, isAuthenticated, loading, role, router]);

  return { isAuthenticated, role, loading };
}
