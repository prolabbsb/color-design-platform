// src/app/(platform)/architect/indications/page.tsx
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { IndicationStatus, Role } from '@prisma/client';
import { format } from 'date-fns';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import ExportCSVButton from '@/components/architect/ExportCSVButton'; // 1. IMPORTAR O BOTÃO

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getRequesterId(): Promise<string | null> {
  // ... (getRequesterId - sem alteração)
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  if (!tokenCookie) redirect('/');
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { userId: string }).userId;
  } catch (e) { redirect('/'); }
}

async function getMyIndications(architectId: string) {
  // ... (getMyIndications - sem alteração)
  const indications = await prisma.indication.findMany({
    where: { architectId: architectId }, 
    include: {
      client: { select: { name: true } },
      _count: { select: { products: true, quotes: true } }
    },
    orderBy: { createdAt: 'desc' },
  });
  return indications;
}

const statusStyles: Record<IndicationStatus, string> = {
  // ... (statusStyles - sem alteração)
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  CONCLUDED: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
};

export default async function MyIndicationsPage() {
  const architectId = await getRequesterId();
  if (!architectId) return <div>Acesso negado.</div>; 

  const indications = await getMyIndications(architectId);

  return (
    <div>
      {/* 2. ATUALIZAR O HEADER DA PÁGINA */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-pink">Meus Projetos (Indicações)</h1>
          <p className="mt-2 text-gray-600 font-body">Acompanhe o status de todos os projetos que você criou.</p>
        </div>
        <div>
          <ExportCSVButton /> {/* 3. RENDERIZAR O BOTÃO */}
        </div>
      </div>

      <div className="mt-10 bg-white rounded-lg shadow-md overflow-hidden">
        {/* ... (Tabela - sem alteração) ... */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orçamentos</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {indications.map((ind) => (
              <tr key={ind.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ind.client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(ind.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[ind.status]}`}>
                    {ind.status}
                  </span>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ind._count.quotes}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link href={`/architect/indications/${ind.id}`} className="text-brand-orange hover:text-brand-orange/80">
                    Ver Detalhes
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