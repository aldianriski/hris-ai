'use client';

interface RevenueDataPoint {
  month: string;
  mrr: number;
  arr: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  // Show message if no data
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No revenue data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.mrr));

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600 dark:text-gray-400">MRR (Monthly Recurring Revenue)</span>
        </div>
      </div>

      {/* Line Chart (simplified) */}
      <div className="h-64 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Rp {(maxValue / 1000000).toFixed(0)}M</span>
          <span>Rp {((maxValue * 0.75) / 1000000).toFixed(0)}M</span>
          <span>Rp {((maxValue * 0.5) / 1000000).toFixed(0)}M</span>
          <span>Rp {((maxValue * 0.25) / 1000000).toFixed(0)}M</span>
          <span>Rp 0M</span>
        </div>

        {/* Chart area */}
        <div className="ml-16 h-full flex items-end justify-between gap-3 pb-8">
          {data.map((dataPoint, index) => {
            const height = (dataPoint.mrr / maxValue) * 100;
            const prevHeight = index > 0 ? (data[index - 1].mrr / maxValue) * 100 : height;

            return (
              <div key={index} className="flex-1 relative h-full flex flex-col justify-end">
                {/* Line connector */}
                {index > 0 && (
                  <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ left: '-50%' }}
                  >
                    <line
                      x1="100%"
                      y1={`${100 - prevHeight}%`}
                      x2="150%"
                      y2={`${100 - height}%`}
                      stroke="rgb(34, 197, 94)"
                      strokeWidth="2"
                    />
                  </svg>
                )}

                {/* Data point */}
                <div className="relative group">
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 cursor-pointer hover:scale-125 transition-transform"
                    style={{ bottom: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      <div className="font-medium">{dataPoint.month}</div>
                      <div className="text-green-400">
                        MRR: Rp {(dataPoint.mrr / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-gray-300 text-xs">
                        ARR: Rp {(dataPoint.arr / 1000000).toFixed(0)}M
                      </div>
                    </div>
                  </div>

                  {/* Month label */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 dark:text-gray-400">
                    {dataPoint.month}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current MRR</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            Rp {(data[data.length - 1].mrr / 1000000).toFixed(1)}M
          </p>
          {data.length > 1 && data[0].mrr > 0 && (
            <p className="text-xs text-green-600">
              +{(((data[data.length - 1].mrr - data[0].mrr) / data[0].mrr) * 100).toFixed(1)}% growth
            </p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Current ARR</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            Rp {(data[data.length - 1].arr / 1000000).toFixed(0)}M
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            12x MRR
          </p>
        </div>
      </div>
    </div>
  );
}
