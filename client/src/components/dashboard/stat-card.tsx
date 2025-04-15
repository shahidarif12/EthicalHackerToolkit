import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{title}</h3>
          <span className="text-primary">{icon}</span>
        </div>
        <p className="text-3xl font-bold">{value}</p>
        {trend && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <span className={trend.positive ? "text-success font-medium" : "text-error font-medium"}>
              {trend.value}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
