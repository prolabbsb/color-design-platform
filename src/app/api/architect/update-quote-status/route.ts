// src/app/api/architect/update-quote-status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Role, QuoteStatus } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// Helper para pegar o ID do Arquiteto
async function getRequesterId(): Promise<string | null> {
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { userId: string }).userId;
  } catch (e) { return null; }
}

const updateQuoteSchema = z.object({
  quoteId: z.string(),
  newStatus: z.enum([QuoteStatus.APPROVED, QuoteStatus.REJECTED]), // Só permite aprovar ou rejeitar
});

export async function POST(request: Request) {
  try {
    const architectId = await getRequesterId();
    if (!architectId) {
      return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { quoteId, newStatus } = updateQuoteSchema.parse(body);

    // --- Verificação de Segurança Crucial ---
    // O arquiteto logado é dono do projeto ao qual este orçamento pertence?
    const quote = await prisma.quote.findFirst({
      where: {
        id: quoteId,
        indication: {
          architectId: architectId, // O 'pai' (Indication) deve pertencer a este arquiteto
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ message: 'Orçamento não encontrado ou você não tem permissão para esta ação.' }, { status: 403 });
    }
    
    if (quote.status !== 'PENDING') {
       return NextResponse.json({ message: 'Este orçamento não pode mais ser alterado.' }, { status: 400 });
    }

    // Atualiza o status do orçamento
    await prisma.quote.update({
      where: { id: quoteId },
      data: { status: newStatus },
    });
    
    // (Opcional) Se for aprovado, podemos querer rejeitar automaticamente outros orçamentos pendentes para este projeto.
    if (newStatus === 'APPROVED') {
        await prisma.quote.updateMany({
            where: {
                indicationId: quote.indicationId,
                status: 'PENDING',
            },
            data: { status: 'REJECTED' } // Rejeita outros orçamentos pendentes
        });
    }

    return NextResponse.json({ message: `Orçamento ${newStatus.toLowerCase()} com sucesso!` }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Update Quote Status API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}