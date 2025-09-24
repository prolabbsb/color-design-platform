// src/app/api/admin/products/add-piece/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// Helper para verificar o token do Admin
async function getRequesterRole(): Promise<Role | null> {
  // ... (mesma função de verificação de token/admin) ...
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { role: Role }).role;
  } catch (e) {
    return null;
  }
}

// Schema de validação para a nova peça
const pieceSchema = z.object({
  catalogItemId: z.string(),
  name: z.string().min(1, "Nome da peça é obrigatório"),
  quantity: z.coerce.number().int().min(1),
  height: z.coerce.number().min(0.1),
  width: z.coerce.number().min(0.1),
  depth: z.coerce.number().min(0.1),
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
    const parsedData = pieceSchema.parse(body);

    // 3. Criar a Peça no Banco, vinculada ao Item do Catálogo
    const newPiece = await prisma.piece.create({
      data: {
        ...parsedData,
      },
    });

    return NextResponse.json({ message: 'Peça adicionada com sucesso!', piece: newPiece }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Add Piece API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}