// src/components/admin/UserStatusActions.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AccountStatus } from '@prisma/client';
import { Check, XCircle, Slash } from 'lucide-react';

interface UserActionsProps {
  user: {
    id: string;
    status: AccountStatus;
  };
}

export default function UserStatusActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async (newStatus: AccountStatus) => {
    setIsLoading(true);
    const response = await fetch('/api/admin/users/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, newStatus }),
    });
    
    if (response.ok) {
      router.refresh(); // Recarrega a tabela do servidor
    } else {
      alert('Falha ao atualizar status.');
    }
    setIsLoading(false);
  };

  if (user.status === 'PENDING_APPROVAL') {
    return (
      <div className="flex gap-2">
        <button
          title="Aprovar Usuário"
          disabled={isLoading}
          onClick={() => handleUpdateStatus('ACTIVE')}
          className="p-2 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          <Check size={16} />
        </button>
        <button
          title="Rejeitar/Inativar Usuário"
          disabled={isLoading}
          onClick={() => handleUpdateStatus('INACTIVE')}
          className="p-2 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:bg-gray-400"
        >
          <XCircle size={16} />
        </button>
      </div>
    );
  }
  
  if (user.status === 'ACTIVE') {
    return (
      <button
        title="Suspender Conta"
        disabled={isLoading}
        onClick={() => handleUpdateStatus('INACTIVE')}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-brand-orange rounded hover:bg-orange-700 disabled:bg-gray-400"
      >
        <Slash size={14} /> Suspender
      </button>
    );
  }

  if (user.status === 'INACTIVE') {
    return (
       <button
        title="Reativar Conta"
        disabled={isLoading}
        onClick={() => handleUpdateStatus('ACTIVE')}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        <Check size={14} /> Reativar
      </button>
    );
  }
  
  return null;
}