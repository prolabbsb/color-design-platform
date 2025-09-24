// src/app/(platform)/architect/indications/[id]/page.tsx
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { notFound, redirect } from 'next/navigation';
import AddCustomProductModal from '@/components/architect/AddCustomProductModal';
import AddCatalogProductModal from '@/components/architect/AddCatalogProductModal';
import QuoteManager from '@/components/architect/QuoteManager'; // 1. IMPORTAR O NOVO COMPONENTE

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// A função getProjectData já busca os orçamentos (quotes), então está pronta.
async function getProjectData(projectId: string): Promise<{ indication: any; catalog: any[] }> {
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) redirect('/login');
  let userId: string;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    userId = (payload as { userId: string }).userId;
  } catch (e) {
    redirect('/login');
  }

  const indication = await prisma.indication.findUnique({
    where: { id: projectId, architectId: userId },
    include: {
      client: { include: { addresses: true, contacts: true } },
      products: { 
        orderBy: { name: 'asc' },
        include: { catalogItem: true, pieces: true, assets: true },
      },
      quotes: { orderBy: { createdAt: 'desc' } }, // Query já existente
    },
  });

  if (!indication) notFound();

  const catalog = await prisma.productCatalog.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, sku: true }
  });

  return { indication, catalog };
}

interface ProjectDetailPageProps {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { indication: project, catalog } = await getProjectData(params.id);

  const clientEmail = project.client.contacts.find((c: any) => c.type === 'EMAIL_MAIN')?.value || 'N/A';
  const clientPhone = project.client.contacts.find((c: any) => c.type === 'PHONE_MAIN')?.value || 'N/A';

  return (
    <div>
      {/* ... (Header da página) ... */}
       <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-pink">Detalhes do Projeto</h1>
        <p className="text-gray-500 text-sm font-mono mt-1">ID: {project.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ... (Card do Cliente) ... */}
           <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="font-display text-xl font-bold text-brand-black mb-4">Cliente</h2>
             <p><strong>Nome:</strong> {project.client.name}</p>
             <p><strong>Email:</strong> {clientEmail}</p>
             <p><strong>Telefone:</strong> {clientPhone}</p>
           </div>

           {/* ... (Card de Produtos do Projeto) ... */}
           <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold text-brand-black">Produtos do Projeto</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                 <AddCatalogProductModal indicationId={project.id} catalog={catalog} />
                 <AddCustomProductModal indicationId={project.id} /> 
              </div>
            </div>
             <div className="divide-y divide-gray-200">
              {project.products.length === 0 ? (
                <p className="text-gray-500">Nenhum produto adicionado...</p>
              ) : (
                project.products.map(product => (
                  <div key={product.id} className="py-4">{/* ... (lista de produtos) ... */}</div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           {/* ... (Card de Status do Projeto) ... */}
           <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="font-display text-xl font-bold text-brand-black mb-4">Status do Projeto</h2>
             <p><strong>Status:</strong> {project.status}</p>
             <p><strong>RT Solicitado:</strong> {String(project.requestedCommissionPercentage)}%</p>
           </div>
           
           {/* --- CARD DE ORÇAMENTOS ATUALIZADO --- */}
           <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="font-display text-xl font-bold text-brand-black mb-4">Orçamentos da Empresa</h2>
             
             {/* 2. SUBSTITUINDO O PLACEHOLDER PELO NOVO COMPONENTE */}
             <QuoteManager initialQuotes={project.quotes} />

           </div>
        </div>

      </div>
    </div>
  );
}