// src/app/page.tsx
'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json(); // Sempre pegue o JSON da resposta

    if (response.ok) {
      // --- LÓGICA DE REDIRECIONAMENTO INTELIGENTE ---
      if (data.role === 'ADMIN') {
        router.push('/admin/dashboard'); // Redireciona Admins
      } else {
        router.push('/architect/dashboard'); // Redireciona Arquitetos
      }
    } else {
      setError(data.message || 'Falha no login.');
    }
  };

  // O resto do JSX da página continua o mesmo
  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center p-4
                 bg-gradient-to-br from-brand-blue to-brand-pink"
    >
      <div className="text-center mb-8">
        <Image
          src="/LOGO_COLOR_NOVA.jpeg"
          alt="Color Design Logo"
          width={180}
          height={180}
          className="mx-auto mb-4 rounded-full shadow-lg"
        />
        <h1 className="font-display text-4xl font-bold tracking-wider text-brand-black drop-shadow-md">
          COLOR DESIGN
        </h1>
        <p className="font-body text-sm text-gray-800 mt-1 drop-shadow-sm">
          Entre curvas e cores, um universo de possibilidades.
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h2 className="font-display text-2xl text-center text-brand-pink mb-6">
          Acesso de Parceiro
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-body text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
            />
          </div>
          <div>
            <label className="font-body text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
            />
          </div>
          {error && <p className="text-sm text-brand-red text-center">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
          >
            ENTRAR
          </button>
        </form>
      </div>
    </main>
  );
}