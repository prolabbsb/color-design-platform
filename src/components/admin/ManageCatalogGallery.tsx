// src/components/admin/ManageCatalogGallery.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import Image from 'next/image'; // Usamos o Image do Next.js

// Interface local para evitar importar Prisma no cliente
interface LocalCatalogImage {
  id: string;
  url: string;
  altText: string | null;
}

interface ManageGalleryProps {
  catalogId: string;
  initialImages: LocalCatalogImage[];
}

export default function ManageCatalogGallery({ catalogId, initialImages }: ManageGalleryProps) {
  const router = useRouter();
  
  const [url, setUrl] = useState('');
  const [altText, setAltText] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch('/api/admin/catalog/add-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catalogItemId: catalogId, url, altText }),
    });

    const data = await response.json();
    if (response.ok) {
      setUrl(''); setAltText('');
      router.refresh(); // Recarrega a Server Page
    } else {
      setError(data.message || 'Falha ao adicionar imagem.');
    }
    setIsLoading(false);
  };
  
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta imagem?')) return;
    
    const response = await fetch('/api/admin/catalog/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    });
    
    if (response.ok) {
      router.refresh(); // Recarrega a página
    } else {
      const data = await response.json();
      alert(`Erro: ${data.message}`);
    }
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="font-display text-xl font-bold text-brand-black mb-4">Galeria de Fotos Padrão</h2>
      
      {/* Grid de Imagens Existentes (Thumbnails) */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {initialImages.map((image) => (
          <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden group border">
            <Image
              src={image.url}
              alt={image.altText || 'Imagem do produto'}
              layout="fill"
              objectFit="cover"
              className="bg-gray-100"
            />
            <button
              onClick={() => handleDeleteImage(image.id)}
              className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Deletar Imagem"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
         {initialImages.length === 0 && <p className="text-gray-500 text-sm col-span-4">Nenhuma imagem cadastrada para este produto.</p>}
      </div>
      
      <hr className="my-4" />
      <form onSubmit={handleAddImage} className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gray-800">Adicionar Nova Imagem</h3>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Cole a URL da imagem aqui (ex: https://...)"
          required
          className="w-full p-2 border rounded-md"
        />
        <input
          type="text"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Texto alternativo (descrição da imagem)"
          className="w-full p-2 border rounded-md"
        />
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400"
        >
          <Plus size={16} />
          {isLoading ? 'Adicionando...' : 'Adicionar Imagem'}
        </button>
      </form>
    </div>
  );
}