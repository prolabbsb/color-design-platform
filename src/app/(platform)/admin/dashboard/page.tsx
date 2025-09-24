// src/app/(platform)/admin/dashboard/page.tsx
import KpiCard from '@/components/dashboard/KpiCard';
import { Users, FileText, DollarSign, CheckCircle } from 'lucide-react';
import prisma from '@/lib/prisma';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import AdminChart from '@/components/admin/AdminChart';
import AdminExportCSVButton from '@/components/admin/AdminExportCSVButton';

// Esta função busca os dados no servidor
async function getAdminAnalytics() {
  const sixMonthsAgo = subMonths(new Date(), 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // Executamos todas as queries em paralelo
  const [
    totalArchitects,
    totalIndications,
    concludedSales,
    totalCommissionsPaid,
    monthlyIndications
  ] = await prisma.$transaction([
    prisma.user.count({ where: { role: 'ARCHITECT' } }),
    prisma.indication.count(),
    prisma.indication.count({ where: { status: 'CONCLUDED' } }),
    prisma.commission.aggregate({
      _sum: { amount: true },
      where: { status: 'PAID' },
    }),
    prisma.indication.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    }),
  ]);
  
  // --- Processamento dos dados do Gráfico ---
  const monthlyData: { [key: string]: number } = {};
  const monthLabels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthName = format(date, 'MMM', { locale: ptBR });
    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    monthlyData[capitalizedMonthName] = 0;
    monthLabels.push(capitalizedMonthName);
  }
  monthlyIndications.forEach(ind => {
    const monthName = format(new Date(ind.createdAt), 'MMM', { locale: ptBR });
    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    if (monthlyData.hasOwnProperty(capitalizedMonthName)) {
      monthlyData[capitalizedMonthName]++;
    }
  });
  const chartData = monthLabels.map(name => ({
    name: name,
    total: monthlyData[name],
  }));

  return { 
    totalArchitects, 
    totalIndications, 
    concludedSales,
    totalCommissionsPaid: totalCommissionsPaid._sum.amount || 0, 
    chartData
  };
}


export default async function AdminDashboardPage() {
  const data = await getAdminAnalytics();
  
  const formattedCommissions = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(data.totalCommissionsPaid));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-pink">Dashboard Geral</h1>
          <p className="mt-2 text-gray-600 font-body">
            Visão global da plataforma de parceiros.
          </p>
        </div>
        <div>
          <AdminExportCSVButton />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Total de Arquitetos" value={data.totalArchitects.toString()} icon={Users} />
        <KpiCard title="Total de Indicações" value={data.totalIndications.toString()} icon={FileText} />
        <KpiCard title="Vendas Concluídas" value={data.concludedSales.toString()} icon={CheckCircle} />
        
        {/* --- CORREÇÃO AQUI --- */}
        {/* Removido o 'TwoColumn' e corrigida a sintaxe das props */}
        <KpiCard
          title="Total de Comissões Pagas"
          value={formattedCommissions} 
          icon={DollarSign}
        />
      </div>
      
      <AdminChart data={data.chartData} color="#C930A5" />
    </div>
  );
}