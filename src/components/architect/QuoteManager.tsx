// src/components/architect/QuoteManager.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuoteStatus } from '@prisma/client';
import { Check, X } from 'lucide-react';

// ATUALIZADO: Interface local agora inclui os novos campos
type LocalQuote = {
  id: string;
  amount: any;
  status: QuoteStatus;
  notes: string | null;
  createdAt: string;
  deliveryTimeframe: string | null;
  paymentConditions: string | null;
}

interface QuoteManagerProps {
  initialQuotes: LocalQuote[];
}

const statusStyles: Record<QuoteStatus, string> = {
  PENDING: 'text-yellow-800 border-yellow-300 bg-yellow-100',
  APPROVED: 'text-green-800 border-green-300 bg-green-100',
  REJECTED: 'text-red-800 border-red-300 bg-red-100',
  REVISED: 'text-gray-600 border-gray-300 bg-gray-100',
};

export default function QuoteManager({ initialQuotes }: QuoteManagerProps) {
  const router = useRouter();
  const [quotes, setQuotes] = useState(initialQuotes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async (quoteId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    // ... (mesma função handleUpdateStatus, sem alteração) ...
    setIsLoading(true);
    setError(null);
    const response = await fetch('/api/architect/update-quote-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId, newStatus }),
    });
    if (response.ok) {
      router.refresh(); 
    } else {
      const data = await response.json();
      setError(data.message || `Falha ao ${newStatus === 'APPROVED' ? 'aprovar' : 'rejeitar'}.`);
    }
    setIsLoading(false);
  };

  if (quotes.length === 0) {
    return <p className="text-gray-500 text-sm">Nenhum orçamento recebido ainda.</p>;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-brand-red mb-4">{error}</p>}
      {quotes.map(quote => (
        <div key={quote.id} className={`p-4 border-2 rounded-lg ${statusStyles[quote.status]}`}>
          <div className="flex justify-between items-center">
            <span className="font-bold text-xl">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(quote.amount))}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full uppercase">{quote.status}</span>
          </div>
          
          {/* --- NOVOS CAMPOS EXIBIDOS AQUI --- */}
          <div className="mt-4 text-sm border-t border-gray-900 border-opacity-10 pt-4">
             <p><strong>Prazo de Entrega:</strong> {quote.deliveryTimeframe || 'N/A'}</p>
             <p><strong>Condições de Pag.:</strong> {quote.paymentConditions || 'N/A'}</p>
             <p className="mt-2"><strong>Notas:</strong> {quote.notes || 'Sem observações.'}</p>
          </div>
          
          {quote.status === 'PENDING' && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleUpdateStatus(quote.id, 'APPROVED')}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                <Check size={14} /> Aprovar
              </button>
              <button
                onClick={() => handleUpdateStatus(quote.id, 'REJECTED')}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-400"
              >
                <X size={14} /> Rejeitar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}