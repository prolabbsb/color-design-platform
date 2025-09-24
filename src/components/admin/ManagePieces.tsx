// src/components/admin/ManagePieces.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// REMOVIDO: import type { Piece } from '@prisma/client'; // <-- ESTA LINHA CAUSAVA O ERRO
import { Plus, Trash2 } from 'lucide-react';

// --- ADICIONADO ---
// Definimos uma interface local apenas com os campos que este componente precisa.
// Isso quebra a dependência do Prisma no lado do cliente.
// Usamos 'any' para os tipos Decimal do Prisma, pois eles são serializados.
interface LocalPiece {
  id: string;
  name: string;
  quantity: number;
  height: any;
  width: any;
  depth: any;
}

interface ManagePiecesProps {
  catalogId: string;
  initialPieces: LocalPiece[]; // Usamos nossa interface local
}

export default function ManagePieces({ catalogId, initialPieces }: ManagePiecesProps) {
  const router = useRouter();
  // O useState agora usa a nossa interface local (ou será inferido)
  const [pieces, setPieces] = useState(initialPieces);
  
  const [name, setName] = useState('Peça');
  const [quantity, setQuantity] = useState('1');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const response = await fetch('/api/admin/products/add-piece', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catalogItemId: catalogId, name, quantity, height, width, depth }),
    });

    const data = await response.json();
    if (response.ok) {
      setName('Peça'); setQuantity('1'); setHeight(''); setWidth(''); setDepth('');
      router.refresh(); // Isso irá recarregar a Server Page, que passará a nova lista de peças
    } else {
      setError(data.message || 'Falha ao adicionar peça.');
    }
    setIsLoading(false);
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="font-display text-xl font-bold text-brand-black mb-4">Gerenciador de Peças (Componentes)</h2>
      
      <div className="mb-6 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Nome</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Qtd.</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Dimensões (A x L x P)</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Excluir</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pieces.map((piece) => ( // O TS irá inferir 'piece' como LocalPiece
                  <tr key={piece.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{piece.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{piece.quantity}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {/* O 'String()' lida com o tipo Decimal serializado */}
                      {String(piece.height)}cm x {String(piece.width)}cm x {String(piece.depth)}cm
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <hr className="my-4" />
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="font-display text-lg font-bold text-gray-800">Adicionar Nova Peça</h3>
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
          {isLoading ? 'Adicionando...' : 'Adicionar Peça'}
        </button>
      </form>
    </div>
  );
}

// Helper de Input (sem alteração)
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