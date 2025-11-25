"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useApi(path: string) {
  return {
    list: (params: Record<string, string | number | boolean> = {}) =>
      useQuery({
        queryKey: [path, params],
        queryFn: () => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => searchParams.append(key, String(value)));
          const queryString = searchParams.toString();
          return api.get(`${path}${queryString ? `?${queryString}` : ""}`);
        }
      }),

    get: (id: string | number) =>
      useQuery({
        queryKey: [path, id],
        queryFn: () => api.get(`${path}/${id}`)
      }),

    create: () =>
      useMutation({
        mutationFn: (data: unknown) => api.post(path, data)
      }),

    update: () =>
      useMutation({
        mutationFn: (data: unknown) => api.put(path, data)
      }),

    remove: () =>
      useMutation({
        mutationFn: (id: string | number) => api.delete(`${path}/${id}`)
      })
  };
}
