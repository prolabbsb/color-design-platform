// src/app/api/admin/global-indications-report/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// Função de segurança para verificar se é Admin
async function getRequesterRole(): Promise<Role | null> {
  const cookieStore = await cookies(); // Correção do await
  const tokenCookie = cookieStore.get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { role: Role }).role;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  try {
    if (await getRequesterRole() !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }
    
    // Busca TODOS os dados necessários para o relatório global
    const indications = await prisma.indication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        architect: { select: { name: true, email: true, cau: true } }, // Inclui dados do Arquiteto
        client: {
          include: {
            contacts: { where: { type: 'EMAIL_MAIN' } },
            addresses: { take: 1 },
          }
        },
        commission: true, // Inclui dados da comissão
      }
    });

    return NextResponse.json(indications);

  } catch (e: any) {
    console.error("Erro ao gerar relatório global:", e);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}