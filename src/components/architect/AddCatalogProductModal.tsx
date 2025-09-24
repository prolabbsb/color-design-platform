// src/components/architect/AddCatalogProductModal.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, BookMarked } from 'lucide-react';

// Tipo local para evitar importar o Prisma.
type LocalCatalogItem = {
  id: string;
  name: string;
  sku: string | null;
}

interface AddCatalogProductModalProps {
  indicationId: string;
  catalog: LocalCatalogItem[]; 
}

export default function AddCatalogProductModal({ indicationId, catalog }: AddCatalogProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const [catalogItemId, setCatalogItemId] = useState(catalog[0]?.id || '');
  const [notes, setNotes] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setCatalogItemId(catalog[0]?.id || '');
    setNotes('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch('/api/architect/add-catalog-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indicationId, catalogItemId, notes }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      resetForm();
      router.refresh();
      setTimeout(() => setIsOpen(false), 1500);
    } else {
      setError(data.message || 'Falha ao adicionar produto.');
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* --- ALTERAÇÃO DA COR AQUI --- */}
      {/* Trocamos 'bg-brand-pink' e 'text-white' pela classe do CTA que já funciona */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 transition-opacity"
      >
        <BookMarked size={16} />
        Adicionar do Catálogo
      </button>

      {/* O Modal (Overlay e Conteúdo) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
            <button onClick={() => { setIsOpen(false); resetForm(); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
            <h2 className="font-display text-xl font-bold text-brand-black mb-6">Adicionar Produto do Catálogo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-gray-700">Selecione o Produto</label>
                <select 
                  value={catalogItemId} 
                  onChange={(e) => setCatalogItemId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                >
                  {catalog.map(item => (
                    <option key={item.id} value={item.id}>{item.name} (SKU: {item.sku})</option>
                  ))}
                </select>
              </div>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas ou observações (opcional)" className="w-full p-2 border rounded" />

              {success && <p className="text-sm text-green-600">{success}</p>}
              {error && <p className="text-sm text-brand-red">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading || catalog.length === 0} className="px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400">
                  {isLoading ? 'Adicionando...' : 'Adicionar Produto'}
                </button>
              </div>
              {catalog.length === 0 && <p className="text-xs text-brand-red text-center mt-2">Nenhum produto encontrado no catálogo. Peça a um Admin para cadastrar.</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
}