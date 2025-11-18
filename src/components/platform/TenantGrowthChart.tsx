'use client';

interface GrowthDataPoint {
  month: string;
  total: number;
  new: number;
  churned: number;
}

interface TenantGrowthChartProps {
  data: GrowthDataPoint[];
}

export function TenantGrowthChart({ data }: TenantGrowthChartProps) {
  // Show message if no data
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No growth data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.total));

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-gray-600 dark:text-gray-400">Total Tenants</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600 dark:text-gray-400">New</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600 dark:text-gray-400">Churned</span>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((dataPoint, index) => {
          const height = (dataPoint.total / maxValue) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col-reverse items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                >
                  <div className="flex flex-col items-center justify-end h-full pb-2">
                    <span className="text-xs font-medium text-white">{dataPoint.total}</span>
                  </div>
                </div>

                {/* Indicators for new and churned */}
                <div className="w-full flex justify-center gap-1">
                  {dataPoint.new > 0 && (
                    <div className="flex items-center gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-600">{dataPoint.new}</span>
                    </div>
                  )}
                  {dataPoint.churned > 0 && (
                    <div className="flex items-center gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-xs text-red-600">{dataPoint.churned}</span>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {dataPoint.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
