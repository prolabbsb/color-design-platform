// src/app/(platform)/admin/commissions/page.tsx
import prisma from '@/lib/prisma';
import { CommissionStatus } from '@prisma/client';
import { format } from 'date-fns';
import PayCommissionButton from '@/components/admin/PayCommissionButton'; 

// Função de servidor para buscar todas as comissões e seus dados relacionados
async function getAllCommissions() {
  const commissions = await prisma.commission.findMany({
    // --- CORREÇÃO AQUI ---
    // O 'orderBy' para múltiplos campos deve ser um ARRAY de objetos, e não um objeto único.
    orderBy: [
      { status: 'asc' },       // 1. Ordena por status (PENDENTE primeiro)
      { createdAt: 'desc' }, // 2. Depois ordena por data de criação
    ],
    include: {
      indication: { 
        include: {
          architect: { select: { name: true } }, 
          client: { select: { name: true } },    
        },
      },
    },
  });
  return commissions;
}

// Estilos para os status de Comissão
const statusStyles: Record<CommissionStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
};

export default async function AdminCommissionsPage() {
  const commissions = await getAllCommissions();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-pink">Gestão de Comissões</h1>
      <p className="mt-2 text-gray-600 font-body">
        Revise e aprove os pagamentos de comissão para projetos concluídos.
      </p>

      <div className="mt-10 bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquiteto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente / Projeto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor da Comissão</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Geração</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {commissions.map((comm) => (
              <tr key={comm.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {comm.indication.architect.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {comm.indication.client.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(comm.amount))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(comm.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[comm.status]}`}>
                    {comm.status === 'PENDING' ? 'Pendente' : 'Pago'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {comm.status === 'PENDING' ? (
                    <PayCommissionButton commissionId={comm.id} />
                  ) : (
                    <span className="text-sm text-gray-500">
                      {comm.paidAt ? format(new Date(comm.paidAt), 'dd/MM/yyyy') : 'Pago'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {commissions.length === 0 && <p className="text-center py-8 text-gray-500">Nenhuma comissão encontrada.</p>}
      </div>
    </div>
  );
}