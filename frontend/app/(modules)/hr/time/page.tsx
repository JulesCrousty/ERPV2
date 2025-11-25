"use client";

import Card from "@/components/card";
import { PageTitle } from "@/components/page-title";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Button } from "@/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";
import { Loader } from "@/components/loader";

export default function HRTimePage() {
  useProtectedRoute(["admin", "manager", "employee"]);

  const punchMutation = useMutation({ mutationFn: () => api.post("/hr/time/punch", { source: "WEB" }) });
  const absenceMutation = useMutation({
    mutationFn: () => api.post("/hr/time/absence", { type: "VACATION", days: 1 })
  });

  const lateHours = useQuery({
    queryKey: ["late-hours"],
    queryFn: () => api.post("/analytics/metrics/run", { metric_code: "HR_LATE_HOURS" }) as Promise<{ value: number }>,
    retry: false
  });

  const overtimeHours = useQuery({
    queryKey: ["overtime-hours"],
    queryFn: () => api.post("/analytics/metrics/run", { metric_code: "HR_OVERTIME" }) as Promise<{ value: number }>,
    retry: false
  });

  return (
    <div className="space-y-6">
      <PageTitle title="HR Time" subtitle="Time tracking, attendance and absences" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Late hours" description="Current month">
          {lateHours.isLoading ? <Loader /> : <p className="text-3xl font-semibold">{lateHours.data?.value ?? 0}h</p>}
        </Card>
        <Card title="Overtime" description="Current month" className="bg-primary/5">
          {overtimeHours.isLoading ? <Loader /> : <p className="text-3xl font-semibold">{overtimeHours.data?.value ?? 0}h</p>}
        </Card>
        <Card title="Absence requests" description="Workflow">
          <p className="text-3xl font-semibold">Managed</p>
        </Card>
      </div>
      {(punchMutation.error || absenceMutation.error) && (
        <Alert variant="destructive">
          <AlertTitle>Time event failed</AlertTitle>
          <AlertDescription>{((punchMutation.error || absenceMutation.error) as Error).message}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Clock in/out" description="Send punch to backend">
          <Button onClick={() => punchMutation.mutate()} disabled={punchMutation.isLoading}>
            {punchMutation.isLoading ? "Posting..." : "Post punch"}
          </Button>
        </Card>
        <Card title="Request absence" description="Vacation/leave">
          <Button onClick={() => absenceMutation.mutate()} disabled={absenceMutation.isLoading}>
            {absenceMutation.isLoading ? "Submitting..." : "Submit absence"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
