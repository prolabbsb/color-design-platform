// src/app/api/admin/projects/create-quote/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Role, QuoteStatus } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getRequesterRole(): Promise<Role | null> {
  // ... (mesma função de verificação) ...
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { role: Role }).role;
  } catch (e) {
    return null;
  }
}

// ATUALIZADO: Schema agora inclui os novos campos
const quoteSchema = z.object({
  indicationId: z.string(),
  amount: z.coerce.number().positive("O valor deve ser positivo"),
  notes: z.string().optional(),
  deliveryTimeframe: z.string().optional(), // Novo campo
  paymentConditions: z.string().optional(), // Novo campo
});

export async function POST(request: Request) {
  try {
    if (await getRequesterRole() !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json();
    const { indicationId, amount, notes, deliveryTimeframe, paymentConditions } = quoteSchema.parse(body);

    // ATUALIZADO: Criação do orçamento com todos os campos
    const newQuote = await prisma.quote.create({
      data: {
        indicationId,
        amount,
        notes,
        deliveryTimeframe,
        paymentConditions,
        status: QuoteStatus.PENDING,
      },
    });
    
    await prisma.indication.update({
      where: { id: indicationId },
      data: { status: 'IN_PROGRESS' }
    });

    return NextResponse.json({ message: 'Orçamento enviado!', quote: newQuote }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Create Quote API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}