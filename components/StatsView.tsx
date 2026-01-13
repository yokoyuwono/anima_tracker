import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { MediaItem, MediaType, MediaStatus } from '../types';

interface StatsViewProps {
  items: MediaItem[];
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#ef4444', '#f59e0b', '#22c55e'];

export const StatsView: React.FC<StatsViewProps> = ({ items }) => {
  const statusData = Object.values(MediaStatus).map(status => ({
    name: status,
    value: items.filter(i => i.status === status).length
  })).filter(d => d.value > 0);

  const typeData = Object.values(MediaType).map(type => ({
    name: type,
    value: items.filter(i => i.type === type).length
  })).filter(d => d.value > 0);

  const ratingDist = Array.from({ length: 11 }, (_, i) => ({
    rating: i,
    count: items.filter(item => Math.round(item.rating) === i).length
  }));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
        <p className="text-lg">Belum ada data.</p>
        <p className="text-sm">Mulai tracking untuk melihat statistik.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 animate-fade-in pb-10">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 bg-slate-800 p-4 rounded-2xl border border-slate-700">
         <div className="text-center">
            <span className="block text-2xl font-bold text-white">{items.length}</span>
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Judul</span>
        </div>
         <div className="text-center border-x border-slate-700">
            <span className="block text-2xl font-bold text-purple-400">
                {items.reduce((acc, curr) => acc + curr.currentProgress, 0)}
            </span>
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Chapter</span>
        </div>
        <div className="text-center">
            <span className="block text-2xl font-bold text-yellow-400">
                {(items.reduce((acc, curr) => acc + curr.rating, 0) / (items.length || 1)).toFixed(1)}
            </span>
            <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Rating</span>
        </div>
      </div>

      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
        <h3 className="text-base font-bold text-white mb-4">Status</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
        <h3 className="text-base font-bold text-white mb-4">Distribusi Rating</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ratingDist}>
              <XAxis dataKey="rating" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#334155'}}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};