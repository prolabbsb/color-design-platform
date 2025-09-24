// src/components/architect/IndicationsChart.tsx
'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Definimos a "forma" dos dados que esperamos
interface ChartData {
  name: string; // O nome do mês (ex: "Jan")
  total: number; // O total de indicações
}

interface IndicationsChartProps {
  data: ChartData[]; // Recebe os dados do componente de servidor
}

export default function IndicationsChart({ data }: IndicationsChartProps) {
  return (
    <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="font-display text-xl font-bold text-brand-black mb-6">
        Indicações nos Últimos 6 Meses
      </h2>
      
      {/* O 'ResponsiveContainer' faz o gráfico se adaptar ao tamanho do card */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
            tickFormatter={(value) => `${value}`} // Mostra os números no eixo Y
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '8px' }}
          />
          <Bar 
            dataKey="total" 
            fill="#C930A5" // Cor Rosa Pink (Destaques Criativos)
            radius={[4, 4, 0, 0]} // Cantos arredondados no topo da barra
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
