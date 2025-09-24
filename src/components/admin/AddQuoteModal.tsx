// src/components/admin/AddQuoteModal.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, DollarSign } from 'lucide-react';

export default function AddQuoteModal({ indicationId }: { indicationId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Novos estados para os novos campos
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryTimeframe, setDeliveryTimeframe] = useState('');
  const [paymentConditions, setPaymentConditions] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setAmount(''); setNotes(''); setDeliveryTimeframe(''); setPaymentConditions('');
    setError(null); setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Enviar o payload completo
    const response = await fetch('/api/admin/projects/create-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        indicationId, 
        amount, 
        notes, 
        deliveryTimeframe, 
        paymentConditions 
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      resetForm();
      router.refresh(); 
      setTimeout(() => setIsOpen(false), 1500);
    } else {
      setError(data.message || 'Falha ao enviar orçamento.');
    }
    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-white bg-brand-pink hover:opacity-90"
      >
        <Plus size={16} />
        Enviar Orçamento
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
            <button onClick={() => { setIsOpen(false); resetForm(); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
            <h2 className="font-display text-xl font-bold text-brand-black mb-6">Novo Orçamento</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-gray-700">Valor Total (R$)</label>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 15000.00" required className="w-full p-2 border rounded" />
              </div>
              
              {/* --- NOVOS CAMPOS NO FORMULÁRIO --- */}
               <div>
                <label className="font-body text-sm font-medium text-gray-700">Prazo de Entrega</label>
                <input type="text" value={deliveryTimeframe} onChange={(e) => setDeliveryTimeframe(e.target.value)} placeholder="Ex: 45 dias úteis" className="w-full p-2 border rounded" />
              </div>
               <div>
                <label className="font-body text-sm font-medium text-gray-700">Condições de Pagamento</label>
                <textarea value={paymentConditions} onChange={(e) => setPaymentConditions(e.target.value)} placeholder="Ex: 50% no ato, 50% na entrega" className="w-full p-2 border rounded" />
              </div>

              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas ou observações (opcional)" className="w-full p-2 border rounded" />

              {success && <p className="text-sm text-green-600">{success}</p>}
              {error && <p className="text-sm text-brand-red">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400">
                  {isLoading ? 'Enviando...' : 'Enviar Orçamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}