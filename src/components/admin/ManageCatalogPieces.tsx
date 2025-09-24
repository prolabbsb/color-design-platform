// src/components/admin/ManageCatalogPieces.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';

// Interface local (para evitar importar Prisma no cliente)
interface LocalCatalogPiece {
  id: string;
  name: string;
  quantity: number;
  height: any; // Tipos Decimal são serializados
  width: any;
  depth: any;
}

interface ManagePiecesProps {
  catalogId: string;
  initialPieces: LocalCatalogPiece[];
}

export default function ManageCatalogPieces({ catalogId, initialPieces }: ManagePiecesProps) {
  const router = useRouter();
  const [pieces, setPieces] = useState(initialPieces);
  
  // Estado para o formulário de NOVA peça
  const [name, setName] = useState('Peça');
  const [quantity, setQuantity] = useState('1');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handler para ADICIONAR Peça
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch('/api/admin/catalog/add-piece', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catalogItemId: catalogId, name, quantity, height, width, depth }),
    });

    const data = await response.json();
    if (response.ok) {
      setName('Peça'); setQuantity('1'); setHeight(''); setWidth(''); setDepth('');
      router.refresh(); // Recarrega a Server Page
    } else {
      setError(data.message || 'Falha ao adicionar peça.');
    }
    setIsLoading(false);
  };

  // Handler para DELETAR Peça
  const handleDelete = async (pieceId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta peça padrão?')) return;

    const response = await fetch('/api/admin/catalog/delete-piece', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pieceId }),
    });

    if (response.ok) {
      router.refresh(); // Recarrega a Server Page
    } else {
      const data = await response.json();
      alert(`Erro: ${data.message}`);
    }
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="font-display text-xl font-bold text-brand-black mb-4">Gerenciador de Peças Padrão</h2>
      
      {/* Tabela de Peças Existentes */}
      <div className="mb-6 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Nome</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Qtd.</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dimensões (A x L x P)</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pieces.map((piece) => (
                  <tr key={piece.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{piece.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{piece.quantity}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {String(piece.height)}cm x {String(piece.width)}cm x {String(piece.depth)}cm
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button onClick={() => handleDelete(piece.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pieces.length === 0 && <p className="text-center py-4 text-gray-500">Nenhuma peça padrão definida.</p>}
          </div>
        </div>
      </div>
      
      <hr className="my-4" />
      <form onSubmit={handleAddSubmit} className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gray-800">Adicionar Nova Peça Padrão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Nome da Peça" value={name} onChange={setName} />
          <Input label="Quantidade" type="number" value={quantity} onChange={setQuantity} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Altura (cm)" type="number" value={height} onChange={setHeight} required />
          <Input label="Largura (cm)" type="number" value={width} onChange={setWidth} required />
          <Input label="Profundidade (cm)" type="number" value={depth} onChange={setDepth} required />
        </div>
        {error && <p className="text-sm text-brand-red">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400"
        >
          <Plus size={16} />
          {isLoading ? 'Adicionando...' : 'Adicionar Peça Padrão'}
        </button>
      </form>
    </div>
  );
}

// Helper de Input
function Input({ label, type = 'text', value, onChange, required = false }: { label: string, type?: string, value: string, onChange: (value: string) => void, required?: boolean }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        step="0.01"
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
      />
    </div>
  );
}