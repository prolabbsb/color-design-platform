// src/app/api/admin/update-user/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// Helper para verificar o token do Admin
async function getRequesterRole(): Promise<Role | null> {
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { role: Role }).role;
  } catch (e) {
    return null;
  }
}

// Schema de validação para os dados de ATUALIZAÇÃO
const updateUserSchema = z.object({
  id: z.string(), // Precisamos do ID para saber QUEM atualizar
  name: z.string().min(3, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  role: z.nativeEnum(Role),
});

export async function POST(request: Request) {
  try {
    // 1. Segurança: O Solicitante é um Admin?
    const requesterRole = await getRequesterRole();
    if (requesterRole !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    // 2. Validação dos dados
    const body = await request.json();
    const { id, name, email, role } = updateUserSchema.parse(body);

    // 3. Verificar se o novo e-mail já está em uso por OUTRO usuário
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.id !== id) {
      return NextResponse.json({ message: 'Este e-mail já está em uso por outra conta.' }, { status: 409 });
    }

    // 4. Atualizar o usuário no banco
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        name,
        email,
        role,
      },
    });

    return NextResponse.json({ message: 'Usuário atualizado com sucesso!', user: updatedUser }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Update User API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}