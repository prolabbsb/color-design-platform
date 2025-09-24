// Exemplo: src/app/(auth)/login/page.tsx
'use client'; 
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PasswordInput from '@/components/ui/PasswordInput';

// Helper Input (sem alteração)
function Input({ label, ...props }: { label: string, [key: string]: any }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700">{label}</label>
      <input {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-orange focus:border-brand-orange" />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 1. ADICIONAR ESTADO DE CARREGAMENTO

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // 2. ATIVAR CARREGAMENTO

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.status === 'PENDING_APPROVAL') {
          router.push('/pending-approval'); // Redireciona para a página de pendente
        } else if (data.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/architect/dashboard');
        }
      } else {
        setError(data.message || 'Falha no login.');
        setIsLoading(false); // Desativar carregamento em caso de erro
      }
    } catch (e) {
      setError('Não foi possível conectar ao servidor.');
      setIsLoading(false); // Desativar carregamento em caso de falha
    }
    // Não desativamos o loading no sucesso, pois a página irá redirecionar
  };

  return (
    <main className="..."> {/* Layout principal sem alteração */}
      {/* ... (Logo e Título) ... */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="font-display text-2xl text-center text-brand-pink mb-6">
          Acesso de Parceiro
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="E-mail" type="email"
            value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="seu@email.com" required
          />
          <div>
            <label className="font-body text-sm font-medium text-gray-700">Senha</label>
            <PasswordInput value={password} onChange={setPassword} placeholder="******" required />
          </div>
          {error && <p className="text-sm text-brand-red text-center">{error}</p>}
          
          {/* 3. ATUALIZAR O BOTÃO */}
          <button
            type="submit"
            disabled={isLoading} // Desativa o botão durante o carregamento
            className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Aguarde...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </main>
  );
}