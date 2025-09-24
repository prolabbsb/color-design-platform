// src/app/(auth)/pending-approval/page.tsx
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function PendingPage() {
  return (
    <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8 text-center">
      <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
      <h2 className="font-display text-2xl text-brand-black mb-4">
        Conta Pendente de Aprovação
      </h2>
      <p className="font-body text-gray-700 mb-6">
        Obrigado pelo seu cadastro! Recebemos seus dados. Sua conta precisa ser revisada e aprovada por um administrador.
      </p>
      <p className="font-body text-sm text-gray-600">
        (Isso geralmente acontece após o envio e verificação do seu contrato assinado. Se você já enviou, por favor, aguarde.)
      </p>
      <Link href="/api/logout" className="text-sm text-brand-orange hover:underline mt-4 inline-block">
        Fazer Logout
      </Link>
    </div>
  );
}