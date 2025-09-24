// src/app/(platform)/admin/indications/[id]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AddQuoteModal from '@/components/admin/AddQuoteModal';
import UpdateIndicationStatus from '@/components/admin/UpdateIndicationStatus'; // 1. IMPORTAR

// (Função getProjectDetails - sem alteração)
async function getProjectDetails(projectId: string) {
  const indication = await prisma.indication.findUnique({
    where: { id: projectId },
    include: {
      architect: { select: { name: true, cau: true } },
      client: { include: { addresses: true, contacts: true } },
      products: { 
        orderBy: { name: 'asc' },
        include: { catalogItem: true, pieces: true, assets: true },
      },
      quotes: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!indication) notFound();
  return indication;
}

interface AdminProjectDetailPageProps {
  params: { id: string };
}

export default async function AdminProjectDetailPage({ params }: AdminProjectDetailPageProps) {
  const project = await getProjectDetails(params.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-pink">Análise de Projeto</h1>
          <p className="mt-2 text-gray-600 font-body">Analise os dados e envie um orçamento para o arquiteto.</p>
        </div>
        <AddQuoteModal indicationId={project.id} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ... (Card de Produtos do Projeto - sem alteração) ... */}
          <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="font-display text-xl font-bold text-brand-black mb-4">Produtos do Projeto</h2>
             {/* ... (lista de produtos) ... */}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
             <h2 className="font-display text-xl font-bold text-brand-black mb-4">Dados do Arquiteto</h2>
             <p><strong>Nome:</strong> {project.architect.name}</p>
             <p><strong>CAU:</strong> {project.architect.cau || 'N/A'}</p>
             <p><strong>RT Solicitado:</strong> {String(project.requestedCommissionPercentage)}%</p>
          </div>
          
          {/* --- CARD DE STATUS ATUALIZADO --- */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="font-display text-xl font-bold text-brand-black mb-4">Status do Projeto</h2>
            {/* 2. SUBSTITUÍDO O TEXTO ESTÁTICO PELO COMPONENTE */}
            <UpdateIndicationStatus 
              indicationId={project.id} 
              currentStatus={project.status} 
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="font-display text-xl font-bold text-brand-black mb-4">Orçamentos Enviados</h2>
             {/* ... (lista de orçamentos) ... */}
          </div>
        </div>
      </div>
    </div>
  );
}