// src/components/admin/PayCommissionButton.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck } from 'lucide-react';

export default function PayCommissionButton({ commissionId }: { commissionId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!confirm('Você confirma o pagamento desta comissão? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setIsLoading(true);
    
    const response = await fetch('/api/admin/commissions/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        commissionId: commissionId, 
        newStatus: 'PAID' 
      }),
    });

    if (response.ok) {
      router.refresh(); // Recarrega a tabela do servidor
    } else {
      const data = await response.json();
      alert(`Erro: ${data.message}`);
    }
    
    setIsLoading(false);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
    >
      <CheckCheck size={14} />
      {isLoading ? 'Processando...' : 'Marcar como Pago'}
    </button>
  );
}