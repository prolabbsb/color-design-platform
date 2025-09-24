// src/app/(platform)/admin/products/page.tsx
import prisma from '@/lib/prisma';
import CreateProductModal from '@/components/admin/CreateProductModal'; // O nosso novo modal
import Link from 'next/link';
import { format } from 'date-fns';

async function getProducts() {
  const products = await prisma.productCatalog.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return products;
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-pink">Catálogo de Produtos</h1>
          <p className="mt-2 text-gray-600 font-body">
            Gerencie os produtos mestres disponíveis para os projetos dos arquitetos.
          </p>
        </div>
        <CreateProductModal />
      </div>

      <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Criação</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.basePrice 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(product.basePrice))
                    : 'N/A'
                  }
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(product.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Este link aponta para a página de detalhes que você pediu (para add peças/fotos) */}
                  <Link 
                    href={`/admin/products/${product.id}`} 
                    className="text-brand-orange hover:text-brand-orange/80"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {products.length === 0 && <p className="text-center py-8 text-gray-500">Nenhum produto encontrado no catálogo.</p>}
      </div>
    </div>
  );
}