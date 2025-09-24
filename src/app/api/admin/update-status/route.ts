// src/app/api/admin/users/update-status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Role, AccountStatus } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getRequesterRole(): Promise<Role | null> {
  // ... (mesma função de verificação de admin) ...
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { role: Role }).role;
  } catch (e) { return null; }
}

const updateSchema = z.object({
  userId: z.string(),
  newStatus: z.nativeEnum(AccountStatus), // Espera ACTIVE, INACTIVE, ou PENDING_APPROVAL
});

export async function POST(request: Request) {
  try {
    if (await getRequesterRole() !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, newStatus } = updateSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    return NextResponse.json({ message: `Status do usuário atualizado para ${newStatus}` }, { status: 200 });

  } catch (error) {
     if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Update User Status API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}