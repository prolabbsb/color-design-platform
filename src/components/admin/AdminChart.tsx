// src/components/admin/AdminChart.tsx
'use client';
// Usamos Recharts, conforme o briefing [cite: 259]
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChartData {
  name: string; // Mês
  total: number; // Total de indicações
}

interface AdminChartProps {
  data: ChartData[];
  color: string; // Permite-nos passar a cor
}

export default function AdminChart({ data, color }: AdminChartProps) {
  return (
    <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="font-display text-xl font-bold text-brand-black mb-6">
        Novas Indicações na Plataforma (Últimos 6 Meses)
      </h2>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            allowDecimals={false} // Para não mostrar "1.5" indicações
          />
          <Tooltip
            cursor={{ fill: 'rgba(201, 48, 165, 0.1)' }} // Leve "hover" rosa 
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
          />
          <Bar 
            dataKey="total" 
            fill={color} // Cor passada como prop
            radius={[4, 4, 0, 0]} // Cantos arredondados [cite: 263]
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}