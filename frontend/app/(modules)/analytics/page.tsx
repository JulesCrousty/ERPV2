"use client";

import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import Card from "@/components/card";
import { PageTitle } from "@/components/page-title";
import { AnalyticsWidget } from "@/types/analytics";
import { KpiCard } from "@/components/kpi-card";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const widgets: AnalyticsWidget[] = [
  { id: "w1", title: "Cost", value: "$820K", trend: 4, description: "Operational costs" },
  { id: "w2", title: "Margin", value: "28%", trend: 2, description: "Net margin" },
  { id: "w3", title: "Utilization", value: "86%", trend: -1, description: "Capacity" }
];

const chartData = {
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

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageTitle title="Analytics" subtitle="KPIs and trends" />
      <div className="grid gap-4 md:grid-cols-3">
        {widgets.map((widget) => (
          <KpiCard key={widget.id} label={widget.title} value={widget.value} change={widget.trend} />
        ))}
      </div>
      <Card title="Revenue Trend" description="Year to date">
        <div className="h-80">
          <Line data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </Card>
    </div>
  );
}
