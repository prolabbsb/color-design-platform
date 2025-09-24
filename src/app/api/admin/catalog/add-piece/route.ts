// src/app/api/admin/catalog/add-piece/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

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

// Schema de validação para a nova peça PADRÃO
const catalogPieceSchema = z.object({
  catalogItemId: z.string(),
  name: z.string().min(1, "Nome da peça é obrigatório"),
  quantity: z.coerce.number().int().min(1),
  height: z.coerce.number().min(0.1),
  width: z.coerce.number().min(0.1),
  depth: z.coerce.number().min(0.1),
});

export async function POST(request: Request) {
  try {
    if (await getRequesterRole() !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json();
    const parsedData = catalogPieceSchema.parse(body);

    // Cria a Peça Padrão no banco
    const newPiece = await prisma.catalogPiece.create({
      data: {
        ...parsedData,
      },
    });

    return NextResponse.json({ message: 'Peça padrão adicionada!', piece: newPiece }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Add Catalog Piece API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}