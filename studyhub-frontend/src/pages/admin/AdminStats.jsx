import React from 'react';

const AdminStatsCard = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:border-blue-200 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-[#163A70] mt-1 tracking-tight">{value || 0}</p>
          {trend && (
            <p className={`text-xs mt-1.5 font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last cycle
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center border border-blue-100 flex-shrink-0">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

export default AdminStatsCard;