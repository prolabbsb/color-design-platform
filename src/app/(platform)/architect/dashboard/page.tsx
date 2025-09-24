// src/app/(platform)/architect/dashboard/page.tsx
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { notFound, redirect } from 'next/navigation';
import { FileText, BarChart2, DollarSign } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import KpiCard from '@/components/dashboard/KpiCard';
import CreateIndicationModal from '@/components/architect/CreateIndicationModal';
import ReferralLink from '@/components/architect/ReferralLink';
import IndicationsChart from '@/components/architect/IndicationsChart'; // 1. IMPORTAR O GRÁFICO

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getArchitectId(): Promise<string> {
  // ... (função getArchitectId - corrigida com 'await cookies()')
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  if (!tokenCookie) redirect('/'); 
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { userId: string }).userId;
  } catch (e) {
    redirect('/');
  }
}

// A função de busca de dados agora TAMBÉM busca os dados do gráfico
async function getDashboardData(architectId: string) {
  // Data de 6 meses atrás
  const sixMonthsAgo = subMonths(new Date(), 6);

  // Executamos todas as queries em paralelo
  const [
    user,
    totalIndications,
    concludedIndications,
    pendingCommissions,
    monthlyIndications // 2. NOVA QUERY (para o gráfico)
  ] = await prisma.$transaction([
    // 1. Buscar o usuário
    prisma.user.findUnique({
      where: { id: architectId },
      select: { referralCode: true },
    }),
    // 2. Contar todas as indicações
    prisma.indication.count({
      where: { architectId: architectId },
    }),
    // 3. Contar indicações concluídas
    prisma.indication.count({
      where: { architectId: architectId, status: 'CONCLUDED' },
    }),
    // 4. Somar comissões PENDENTES
    prisma.commission.aggregate({
      _sum: { amount: true },
      where: { status: 'PENDING', indication: { architectId: architectId } },
    }),
    // 5. NOVA QUERY: Buscar indicações dos últimos 6 meses
    prisma.indication.findMany({
      where: {
        architectId: architectId,
        createdAt: {
          gte: sixMonthsAgo, // gte = "maior ou igual a"
        },
      },
      select: {
        createdAt: true, // Só precisamos da data
      }
    }),
  ]);

  if (!user) notFound();
  
  // --- 3. LÓGICA DE PROCESSAMENTO DOS DADOS DO GRÁFICO ---
  // Criamos "baldes" para os últimos 6 meses
  const monthlyData: { [key: string]: number } = {};
  for (let i = 5; i >= 0; i--) {
    const monthName = format(subMonths(new Date(), i), 'MMM', { locale: ptBR });
    monthlyData[monthName] = 0;
  }
  // Preenchemos os "baldes" com os dados do banco
  monthlyIndications.forEach(ind => {
    const monthName = format(new Date(ind.createdAt), 'MMM', { locale: ptBR });
    if (monthlyData.hasOwnProperty(monthName)) {
      monthlyData[monthName]++;
    }
  });
  // Convertemos o objeto para o array que o gráfico espera
  const chartData = Object.keys(monthlyData).map(name => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), // Ex: "jan" -> "Jan"
    total: monthlyData[name],
  }));

  return {
    referralCode: user.referralCode,
    totalIndications,
    concludedIndications,
    pendingAmount: pendingCommissions._sum.amount || 0,
    chartData, // 4. Retornamos os dados formatados
  };
}

export default async function ArchitectDashboardPage() {
  const architectId = await getArchitectId();
  const data = await getDashboardData(architectId);

  const formattedPendingAmount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(data.pendingAmount));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-pink">Meu Dashboard</h1>
          <p className="mt-2 text-gray-600 font-body">
            Bem-vindo à sua central de parceiros.
          </p>
        </div>
        <div>
          <CreateIndicationModal />
        </div>
      </div>

      {/* KPIs (sem alteração) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KpiCard title="Total de Indicações" value={data.totalIndications.toString()} icon={FileText} />
        <KpiCard title="Vendas Concluídas" value={data.concludedIndications.toString()} icon={BarChart2} />
        <KpiCard title="Comissão a Receber (Pendente)" value={formattedPendingAmount} icon={DollarSign} />
      </div>

      {/* 5. RENDERIZAR O GRÁFICO */}
      {/* Passamos os dados do servidor (data.chartData) para a prop 'data' do componente cliente */}
      <IndicationsChart data={data.chartData} />

      {/* Link de Referral (sem alteração) */}
      <ReferralLink referralCode={data.referralCode} />
    </div>
  );
}