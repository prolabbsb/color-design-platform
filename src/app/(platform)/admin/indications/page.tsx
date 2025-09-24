// src/app/(platform)/admin/indications/page.tsx
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { IndicationStatus } from '@prisma/client';
import Link from 'next/link'; // Importar o Link

async function getAllIndications() {
  // ... (função de busca sem alterações) ...
  const indications = await prisma.indication.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      architect: { select: { name: true } },
      client: { 
        select: { name: true, contacts: { where: { type: 'EMAIL_MAIN' }, select: { value: true } } },
      },
    },
  });
  return indications;
}

const statusStyles: Record<IndicationStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  CONCLUDED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
};

export default async function AdminIndicationsPage() {
  const indications = await getAllIndications();

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-pink">Todas as Indicações</h1>
      <p className="mt-2 text-gray-600 font-body">
        Visão global de todos os leads e status de negociação da plataforma.
      </p>

      <div className="mt-10 bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {/* ... (headers da tabela sem alteração) ... */}
             <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arquiteto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor do Projeto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {indications.map((ind) => (
              <tr key={ind.id}>
                {/* ... (células da tabela sem alteração) ... */}
                 <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{ind.client.name}</div>
                  <div className="text-sm text-gray-500">{ind.client.contacts[0]?.value || 'Sem email'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ind.architect.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(ind.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {ind.projectValue 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(ind.projectValue))
                    : 'N/A'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[ind.status]}`}>
                    {ind.status}
                  </span>
                </td>
                
                {/* --- ALTERAÇÃO AQUI --- */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/admin/indications/${ind.id}`} className="text-brand-orange hover:text-brand-orange/80">
                    Analisar / Orçar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}