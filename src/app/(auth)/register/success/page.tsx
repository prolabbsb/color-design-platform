// src/app/(auth)/register/success/page.tsx
import Link from 'next/link';
import { CheckCircle } from 'lucide-react'; // (lucide-react já deve estar instalado)

export default function RegisterSuccessPage() {
  return (
    <div className="w-full max-w-xl bg-white rounded-lg shadow-md p-8 text-center">
      
      {/* Ícone de Sucesso */}
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      
      <h2 className="font-display text-2xl text-brand-pink mb-4">
        Cadastro Recebido com Sucesso!
      </h2>
      
      <p className="font-body text-gray-700 mb-6">
        Sua adesão ao Programa de Parceria Color Design foi enviada. Sua conta está agora <strong>pendente de aprovação</strong> pela nossa equipe.
      </p>

      {/* Instruções de Próximos Passos */}
      <div className="text-left font-body text-gray-600 space-y-4 mb-8 bg-gray-50 p-4 rounded-md border">
        <h3 className="font-display text-lg font-bold text-brand-black">Próximos Passos:</h3>
        <ul className="list-decimal list-inside space-y-2">
          <li>
            <strong>Verifique seu e-mail:</strong> Você receberá uma cópia do Contrato de Adesão (PDF) preenchido com os dados que você forneceu.
          </li>
          <li>
            <strong>Assine e Faça o Upload:</strong> Faça o login na plataforma. Você será direcionado para uma página onde poderá fazer o upload do contrato assinado.
          </li>
          <li>
            <strong>Aguarde a Aprovação:</strong> Após o upload, nossa equipe irá revisar seu contrato e ativar sua conta.
          </li>
        </ul>
      </div>

      {/* Botão para ir ao Login */}
      <Link
        href="/login" // Link para a página de login que refatoramos
        className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 transition-opacity"
      >
        Ir para o Login
      </Link>
    </div>
  );
}