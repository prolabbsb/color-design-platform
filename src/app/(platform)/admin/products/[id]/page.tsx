// src/app/(platform)/admin/products/[id]/page.tsx
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ManageCatalogPieces from '@/components/admin/ManageCatalogPieces';
import ManageCatalogGallery from '@/components/admin/ManageCatalogGallery'; // 1. IMPORTAR

async function getProductDetails(id: string) {
  const product = await prisma.productCatalog.findUnique({
    where: { id: id },
    include: {
      defaultPieces: true, 
      defaultImages: true, // A query já está correta
      defaultAssets: true,
    },
  });

  if (!product) {
    notFound(); 
  }
  return product;
}

interface ProductDetailPageProps {
  params: {
    id: string; 
  };
}

export default async function AdminProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductDetails(params.id);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-brand-pink">{product.name}</h1>
      <p className="mt-2 text-gray-600 font-body">SKU: {product.sku || 'N/A'}</p>
      <p className="mt-4 text-gray-800">{product.description}</p>
      
      <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
         <h2 className="font-display text-xl font-bold text-brand-black mb-4">Informações Básicas</h2>
         {/* TODO: Formulário para editar Nome, SKU, Preço */}
      </div>

      {/* Gerenciador de Peças (Existente) */}
      <ManageCatalogPieces 
        catalogId={product.id} 
        initialPieces={product.defaultPieces} 
      />

      {/* --- SUBSTITUÍDO O PLACEHOLDER --- */}
      {/* 2. RENDERIZAR O NOVO COMPONENTE */}
      <ManageCatalogGallery 
        catalogId={product.id} 
        initialImages={product.defaultImages} 
      />
       
    </div>
  );
}