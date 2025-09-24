// src/components/admin/EditUserModal.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Importamos 'type' do Prisma. Isso é seguro em Componentes de Cliente.
import type { User } from '@prisma/client'; 

// Nosso componente agora aceita o usuário como uma prop
interface EditUserModalProps {
  user: User;
}

export default function EditUserModal({ user }: EditUserModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // O estado do formulário agora é PRÉ-PREENCHIDO com os dados do usuário
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Chamamos a nova API de UPDATE, passando o ID do usuário
    const response = await fetch('/api/admin/update-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name, email, role }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      router.refresh(); // Atualiza a tabela na página
      setTimeout(() => setIsOpen(false), 1500); 
    } else {
      setError(data.message || 'Falha ao atualizar usuário.');
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Este é o link "Editar" na tabela, que agora é um botão para abrir o modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-brand-orange hover:text-brand-orange/80 font-medium"
      >
        Editar
      </button>

      {/* O Modal (Overlay e Conteúdo) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>
            
            <h2 className="font-display text-xl font-bold text-brand-black mb-6">Editar Usuário</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-body text-sm font-medium text-gray-700">Nome Completo</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-gray-700">E-mail</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="font-body text-sm font-medium text-gray-700">Função (Role)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'ARCHITECT')}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="ARCHITECT">Arquiteto</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <p className="text-xs text-gray-500">A redefinição de senha deve ser tratada em um fluxo separado.</p>

              {success && <p className="text-sm text-green-600">{success}</p>}
              {error && <p className="text-sm text-brand-red">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400"
                >
                  {isLoading ? 'Atualizando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}