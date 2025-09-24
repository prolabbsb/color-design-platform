// src/components/architect/ReferralLink.tsx
'use client';
import { useState } from 'react';
import { Copy } from 'lucide-react';

export default function ReferralLink({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  
  // O link de indicação completo, baseado no código do usuário
  const fullLink = `https://colordesign.com.br/r/${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  return (
    <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
      <h2 className="font-display text-xl font-bold text-brand-black mb-4">Seu Link de Indicação</h2>
      <p className="text-sm text-gray-600 mb-4">Compartilhe este link com seus clientes. Todas as vendas geradas por ele serão creditadas a você.</p>
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
        <input
          type="text"
          value={fullLink}
          readOnly
          className="flex-1 bg-transparent border-none outline-none font-mono text-gray-700"
        />
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 transition-opacity"
        >
          <Copy size={16} />
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}