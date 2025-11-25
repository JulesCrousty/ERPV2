"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/ui/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, refreshSession } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      await refreshSession();
      toast({ title: "Welcome back", description: "You are now connected." });
      router.push("/");
    } catch (error) {
      toast({ title: "Authentication failed", description: (error as Error).message });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>ERP Access</CardTitle>
          <CardDescription>Sign in with your enterprise credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@company.com" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
