"use client";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import Card from "@/components/card";
import { PageTitle } from "@/components/page-title";
import { KpiCard } from "@/components/kpi-card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader } from "@/components/loader";
import { useProtectedRoute } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function AnalyticsPage() {
  useProtectedRoute(["admin", "manager"]);

  const datasetQuery = useQuery({
    queryKey: ["revenue-dataset"],
    queryFn: () => api.post("/analytics/datasets/run", { dataset_code: "REVENUE_TREND" }),
    retry: false
  });

  const costMetric = useQuery({
    queryKey: ["cost-metric"],
    queryFn: () => api.post("/analytics/metrics/run", { metric_code: "TOTAL_COST" }),
    retry: false
  });

  const marginMetric = useQuery({
    queryKey: ["margin-metric"],
    queryFn: () => api.post("/analytics/metrics/run", { metric_code: "MARGIN" }),
    retry: false
  });

  const utilizationMetric = useQuery({
    queryKey: ["utilization-metric"],
    queryFn: () => api.post("/analytics/metrics/run", { metric_code: "UTILIZATION" }),
    retry: false
  });

  const chartData = datasetQuery.data?.data || datasetQuery.data?.dataset || datasetQuery.data || {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Revenue",
        data: [120, 140, 135, 150, 160, 180, 190],
        borderColor: "#4C8BF5",
        backgroundColor: "rgba(76,139,245,0.1)",
        tension: 0.4
      }
    ]
  };

  const widgets = [
    { id: "w1", title: "Cost", value: costMetric.data?.value ?? "$0", trend: 4 },
    { id: "w2", title: "Margin", value: marginMetric.data?.value ?? "0%", trend: 2 },
    { id: "w3", title: "Utilization", value: utilizationMetric.data?.value ?? "0%", trend: -1 }
  ];

  const anyError = costMetric.error || marginMetric.error || utilizationMetric.error || datasetQuery.error;

  return (
    <div className="space-y-6">
      <PageTitle title="Analytics" subtitle="KPIs and trends" />
      <div className="grid gap-4 md:grid-cols-3">
        {widgets.map((widget) => (
          <KpiCard key={widget.id} label={widget.title} value={widget.value as string} change={widget.trend} />
        ))}
      </div>
      {anyError && (
        <Alert variant="destructive">
          <AlertTitle>Analytics unavailable</AlertTitle>
          <AlertDescription>{(anyError as Error).message}</AlertDescription>
        </Alert>
      )}
      <Card title="Revenue Trend" description="Year to date">
        {datasetQuery.isLoading ? (
          <div className="h-80 flex items-center justify-center">
            <Loader label="Loading chart" />
          </div>
        ) : (
          <div className="h-80">
            <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        )}
      </Card>
    </div>
  );
}
