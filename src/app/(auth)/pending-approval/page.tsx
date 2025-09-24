// src/app/(auth)/pending-approval/page.tsx
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { AlertTriangle, Clock } from 'lucide-react';
import ContractUploader from '@/components/architect/ContractUploader'; // Nosso novo formulário

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// Função de segurança que busca o usuário PENDENTE pelo cookie
async function getPendingUser() {
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) redirect('/');

  let payload;
  try {
    const verified = await jwtVerify(tokenCookie.value, JWT_SECRET);
    payload = verified.payload as { userId: string, status: string };
  } catch (e) {
    redirect('/');
  }

  // Se o usuário já estiver ativo (talvez o admin aprovou em outra aba), mande para o dashboard
  if (payload.status === 'ACTIVE') {
    redirect('/architect/dashboard');
  }
  
  // Busca o usuário e verifica se ele JÁ tem um documento do tipo CONTRATO
  const userWithContract = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      documents: {
        where: { type: 'CONTRACT' },
      },
    },
  });

  if (!userWithContract) redirect('/');

  return {
    hasUploadedContract: userWithContract.documents.length > 0, // True se já enviou
  };
}


export default async function PendingPage() {
  const { hasUploadedContract } = await getPendingUser();

  return (
    <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8 text-center">
      
      {/* Mostra um ícone diferente dependendo do status do upload */}
      {hasUploadedContract ? (
         <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
      ) : (
         <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
      )}
      
      <h2 className="font-display text-2xl text-brand-black mb-4">
        {hasUploadedContract ? 'Contrato em Análise' : 'Conta Pendente de Aprovação'}
      </h2>
      
      <p className="font-body text-gray-700 mb-6">
        {hasUploadedContract 
          ? 'Recebemos seu contrato assinado. Nossa equipe irá revisá-lo em breve e sua conta será ativada. Obrigado por aguardar.'
          : 'Sua adesão foi recebida. O último passo é enviar seu contrato assinado (que enviamos para seu e-mail) para análise.'
        }
      </p>

      {/* Renderização Condicional: 
        Se NÃO enviou contrato, mostra o formulário de upload. 
        Se JÁ enviou, não mostra nada (apenas a mensagem acima).
      */}
      {!hasUploadedContract && (
        <ContractUploader />
      )}
      
    </div>
  );
}