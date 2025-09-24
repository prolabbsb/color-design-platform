// src/app/(platform)/architect/indications/[id]/page.tsx
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { notFound, redirect } from 'next/navigation';
import AddCustomProductModal from '@/components/architect/AddCustomProductModal'; // <-- Importa o Botão Customizado
import AddCatalogProductModal from '@/components/architect/AddCatalogProductModal'; // <-- 1. IMPORTA O BOTÃO CATÁLOGO

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getProjectData(projectId: string) {
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
    where: { 
      id: projectId,
      architectId: userId,
    },
    include: {
      client: { include: { addresses: true, contacts: true } },
      products: { 
        orderBy: { name: 'asc' },
        include: {
          catalogItem: true,
          pieces: true,
          assets: true,
        },
      },
      quotes: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!indication) notFound();

  const catalog = await prisma.productCatalog.findMany({
    orderBy: { name: 'asc' },
    select: { // Selecionamos apenas os campos que o modal precisa
      id: true,
      name: true,
      sku: true,
    }
  });

  return { indication, catalog };
}

interface ProjectDetailPageProps {
  params: { id: string };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { indication: project, catalog } = await getProjectData(params.id);

  const clientEmail = project.client.contacts.find(c => c.type === 'EMAIL_MAIN')?.value || 'N/A';
  const clientPhone = project.client.contacts.find(c => c.type === 'PHONE_MAIN')?.value || 'N/A';

  return (
    <div>
       <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-brand-pink">Detalhes do Projeto</h1>
        <p className="text-gray-500 text-sm font-mono mt-1">ID: {project.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="font-display text-xl font-bold text-brand-black mb-4">Cliente</h2>
             <p><strong>Nome:</strong> {project.client.name}</p>
             <p><strong>Email:</strong> {clientEmail}</p>
             <p><strong>Telefone:</strong> {clientPhone}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-display text-xl font-bold text-brand-black">Produtos do Projeto</h2>
              
              {/* --- 2. OS DOIS BOTÕES SÃO RENDERIZADOS AQUI --- */}
              {/* Esta é a seção que está faltando no seu arquivo atual. */}
              <div className="flex flex-col sm:flex-row gap-2">
                 <AddCatalogProductModal indicationId={project.id} catalog={catalog} />
                 <AddCustomProductModal indicationId={project.id} /> 
              </div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {project.products.length === 0 ? (
                <p className="text-gray-500">Nenhum produto adicionado a este projeto ainda.</p>
              ) : (
                project.products.map(product => (
                  <div key={product.id} className="py-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-bold text-brand-black">{product.name}</p>
                        <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 rounded">
                          {product.catalogItemId ? `SKU: ${product.catalogItem?.sku}` : 'PRODUTO CUSTOMIZADO'}
                        </span>
                      </div>
                      <p className="text-sm">{product.pieces.length} peça(s)</p>
                    </div>
                    {product.assets.length > 0 && (
                      <a 
                        href={product.assets[0].url} 
                        target="_blank" rel="noopener noreferrer" 
                        className="text-sm text-brand-orange hover:underline"
                      >
                        Ver Arquivo ({product.assets[0].name})
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="font-display text-xl font-bold text-brand-black mb-4">Status do Projeto</h2>
             <p><strong>Status:</strong> {project.status}</p>
             <p><strong>RT Solicitado:</strong> {String(project.requestedCommissionPercentage)}%</p>
           </div>
           <div className="bg-white p-6 rounded-lg shadow-md">
             <h2 className="font-display text-xl font-bold text-brand-black mb-4">Orçamentos da Empresa</h2>
             {project.quotes.length === 0 ? (
               <p className="text-gray-500">Nenhum orçamento recebido ainda.</p>
             ) : (
               <ul>{/* Loop de orçamentos */}</ul>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}