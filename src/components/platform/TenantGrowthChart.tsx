'use client';

// Placeholder chart component - will be replaced with real charting library later
// For now, using simple SVG visualization

const mockData = [
  { month: 'Jun', total: 124, new: 8, churned: 2 },
  { month: 'Jul', total: 132, new: 10, churned: 2 },
  { month: 'Aug', total: 141, new: 11, churned: 2 },
  { month: 'Sep', total: 148, new: 9, churned: 2 },
  { month: 'Oct', total: 152, new: 7, churned: 3 },
  { month: 'Nov', total: 156, new: 12, churned: 8 },
];

export function TenantGrowthChart() {
  const maxValue = Math.max(...mockData.map(d => d.total));

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
        {mockData.map((data, index) => {
          const height = (data.total / maxValue) * 100;

          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col-reverse items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                >
                  <div className="flex flex-col items-center justify-end h-full pb-2">
                    <span className="text-xs font-medium text-white">{data.total}</span>
                  </div>
                </div>

                {/* Indicators for new and churned */}
                <div className="w-full flex justify-center gap-1">
                  {data.new > 0 && (
                    <div className="flex items-center gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-600">{data.new}</span>
                    </div>
                  )}
                  {data.churned > 0 && (
                    <div className="flex items-center gap-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span className="text-xs text-red-600">{data.churned}</span>
                    </div>
                  )}
                </div>
              </div>

              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {data.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
