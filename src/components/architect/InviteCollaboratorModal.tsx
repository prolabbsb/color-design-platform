// src/components/architect/InviteCollaboratorModal.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, UserPlus } from 'lucide-react';
import PasswordInput from '@/components/ui/PasswordInput'; // Importamos o PasswordInput

export default function InviteCollaboratorModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cau, setCau] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setCau('');
    setError(null); setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch('/api/architect/invite-collaborator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, cau }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      resetForm();
      router.refresh(); 
      setTimeout(() => setIsOpen(false), 1500); 
    } else {
      setError(data.message || 'Falha ao convidar colaborador.');
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* --- ALTERAÇÃO AQUI --- */}
      {/* Trocamos 'bg-brand-pink' e 'text-white' por 'bg-brand-cta' e 'text-brand-black' */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 transition-opacity"
      >
        <UserPlus size={16} />
        Convidar Colaborador
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
            <button onClick={() => { setIsOpen(false); resetForm(); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
            <h2 className="font-display text-xl font-bold text-brand-black mb-6">Convidar Colaborador</h2>
            <p className="text-sm text-gray-600 mb-4">O usuário será adicionado ao seu escritório e terá acesso imediato (Ativo) sem necessidade de contrato individual.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nome Completo" value={name} onChange={setName} required />
              <Input label="E-mail (Login)" type="email" value={email} onChange={setEmail} required />
              <Input label="Nº Registro CAU (Opcional)" value={cau} onChange={setCau} />
              
              {/* Usando o PasswordInput (que também foi corrigido) */}
              <div>
                <label className="font-body text-sm font-medium text-gray-700">Senha Provisória</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  required
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              
              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
              {error && <p className="text-sm text-brand-red text-center">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400">
                  {isLoading ? 'Convidando...' : 'Adicionar à Equipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Helper de Input (também corrigido para usar o helper de classe)
function Input({ label, type = 'text', value, onChange, required = false }: { label: string, type?: string, value: string, onChange: (value: string) => void, required?: boolean }) {
  const commonClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm";
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={commonClasses}
      />
    </div>
  );
}