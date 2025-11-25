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
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
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
              <label className="text-sm font-medium text-slate-700">Username</label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="john.doe" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
