// src/components/admin/UpdateIndicationStatus.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IndicationStatus } from '@prisma/client';

// Passamos a indicação inteira (ou pelo menos o status e id)
interface UpdateStatusProps {
  indicationId: string;
  currentStatus: IndicationStatus;
}

// Mapeamento dos status para o dropdown
const statusOptions = [
  { value: IndicationStatus.PENDING, label: 'Pendente' },
  { value: IndicationStatus.IN_PROGRESS, label: 'Em Progresso' },
  { value: IndicationStatus.CONCLUDED, label: 'Concluído (Pago)' },
  { value: IndicationStatus.CANCELED, label: 'Cancelado' },
];

export default function UpdateIndicationStatus({ indicationId, currentStatus }: UpdateStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: IndicationStatus) => {
    setIsLoading(true);
    setError(null);
    setStatus(newStatus); // Atualiza a UI imediatamente

    const response = await fetch('/api/admin/projects/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ indicationId, newStatus }),
    });

    if (response.ok) {
      router.refresh(); // Recarrega os dados da página
    } else {
      const data = await response.json();
      setError(data.message || 'Falha ao atualizar status.');
      setStatus(currentStatus); // Reverte a mudança na UI se a API falhar
    }
    setIsLoading(false);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Alterar Status do Projeto</label>
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as IndicationStatus)}
        disabled={isLoading}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-orange focus:border-brand-orange sm:text-sm rounded-md disabled:bg-gray-200"
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-2 text-sm text-brand-red">{error}</p>}
      {status === 'CONCLUDED' && (
         <p className="mt-2 text-sm text-green-700">Projeto concluído. Comissão gerada e pendente de pagamento.</p>
      )}
    </div>
  );
}