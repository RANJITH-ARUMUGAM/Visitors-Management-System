import React from 'react';
import { Users, Clock, Calendar, AlertTriangle, AlertOctagon, LogOut } from 'lucide-react';

const iconMap = { Users, Clock, Calendar, AlertTriangle, AlertOctagon, LogOut };

function MetricCard({ count, trend, trendType, label, icon, bgColor, borderColor, textColor = 'text-gray-800', pulse = false, badge, badgeColor = 'bg-red-100 text-red-800', onClick }) {
  const Icon = iconMap[icon];
  const trendColor = trendType === 'up' ? 'text-green-600' : 'text-red-600';
  const trendSymbol = trendType === 'up' ? '↑' : '↓';

  return (
    <div
      onClick={onClick}
      className={`${bgColor} ${borderColor} border rounded-[10px] p-3 border-black-800 shadow-20 hover:shadow cursor-pointer transition-all duration-200 relative overflow-hidden`}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-2">
          <div className={`${textColor} opacity-80`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className={`text-xs font-semibold ${trendColor} bg-white bg-opacity-50 px-1.5 py-0.5 rounded-full`}>
            {trendSymbol} {Math.abs(trend)}
          </div>
        </div>

        <div className={`text-2xl font-bold ${textColor} mb-1 ${pulse ? 'animate-pulse' : ''}`}>
          {count}
        </div>

        <div className={`text-xs font-medium ${textColor} opacity-80 line-clamp-2`}>
          {label}
        </div>

        {badge && (
          <div className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded-full ${badgeColor} shadow-sm mt-2`}>
            {badge}
          </div>
        )}
      </div>
    </div>
  );
}

export default MetricCard;