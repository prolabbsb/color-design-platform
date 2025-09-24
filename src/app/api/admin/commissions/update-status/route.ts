// src/app/api/admin/commissions/update-status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Role, CommissionStatus } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getRequesterRole(): Promise<Role | null> {
  // ... (mesma função de verificação de admin) ...
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { role: Role }).role;
  } catch (e) {
    return null;
  }
}

const paySchema = z.object({
  commissionId: z.string(),
  newStatus: z.literal(CommissionStatus.PAID), // Só permite alterar para PAGO
});

export async function POST(request: Request) {
  try {
    if (await getRequesterRole() !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json();
    const { commissionId, newStatus } = paySchema.parse(body);

    const updatedCommission = await prisma.commission.update({
      where: { 
        id: commissionId,
        status: 'PENDING', // Segurança: Só pode pagar comissões pendentes
      },
      data: {
        status: newStatus,
        paidAt: new Date(), // Define a data de pagamento para agora
      },
    });

    return NextResponse.json({ message: 'Comissão marcada como paga!', commission: updatedCommission }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    // Captura erro caso a comissão não seja encontrada (ou já esteja paga)
    if ((error as any).code === 'P2025') { 
        return NextResponse.json({ message: 'Comissão não encontrada ou já foi paga.' }, { status: 404 });
    }
    console.error('Pay Commission API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}