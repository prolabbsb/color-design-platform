// src/app/api/architect/indications-report/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getArchitectId(): Promise<string> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  if (!tokenCookie) throw new Error('Não autorizado');
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { userId: string }).userId;
  } catch (e) {
    throw new Error('Token inválido');
  }
}

export async function GET() {
  try {
    const architectId = await getArchitectId();
    
    // Busca todos os dados necessários para o relatório
    const indications = await prisma.indication.findMany({
      where: { architectId: architectId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          include: {
            contacts: { where: { type: 'EMAIL_MAIN' } },
            addresses: { take: 1 }, // Pega o primeiro endereço
          }
        },
        commission: true, // Inclui dados da comissão
      }
    });

    return NextResponse.json(indications);

  } catch (e: any) {
    if (e.message === 'Não autorizado' || e.message === 'Token inválido') {
      return NextResponse.json({ message: e.message }, { status: 401 });
    }
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}