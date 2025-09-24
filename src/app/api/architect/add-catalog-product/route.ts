// src/app/api/architect/add-catalog-product/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getRequesterId(): Promise<string | null> {
  // ... (mesma função helper de verificação de token) ...
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { userId: string }).userId;
  } catch (e) {
    return null;
  }
}

const schema = z.object({
  indicationId: z.string(),
  catalogItemId: z.string(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const architectId = await getRequesterId();
    if (!architectId) {
      return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    const { indicationId, catalogItemId, notes } = schema.parse(body);

    // Segurança: O arquiteto pode adicionar a este projeto?
    const project = await prisma.indication.findFirst({
      where: { id: indicationId, architectId: architectId },
    });
    if (!project) {
      return NextResponse.json({ message: 'Projeto não encontrado ou você não tem permissão.' }, { status: 403 });
    }

    // Pega o nome do produto do catálogo para copiar
    const catalogItem = await prisma.productCatalog.findUnique({
      where: { id: catalogItemId },
    });
    if (!catalogItem) {
        return NextResponse.json({ message: 'Item de catálogo não encontrado.' }, { status: 404 });
    }

    // Cria a INSTÂNCIA do produto dentro do projeto
    const newProduct = await prisma.product.create({
      data: {
        name: catalogItem.name, // Copia o nome do catálogo
        notes: notes,
        indicationId: indicationId,
        catalogItemId: catalogItemId, // Vincula ao catálogo mestre
      },
    });

    return NextResponse.json({ message: 'Produto do catálogo adicionado!', product: newProduct }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Add Catalog Product API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}