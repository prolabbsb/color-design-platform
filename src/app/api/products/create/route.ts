// src/app/api/admin/products/create/route.ts
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

// Schema de validação para o novo produto do catálogo
const productSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório"),
  sku: z.string().min(2, "SKU é obrigatório"),
  description: z.string().optional(),
  basePrice: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? null : Number(val),
    z.number().nullable()
  ),
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
    const { name, sku, description, basePrice } = productSchema.parse(body);

    // 3. Verificar duplicidade (SKU ou Nome)
    const existing = await prisma.productCatalog.findFirst({
      where: { OR: [{ sku: sku }, { name: name }] }
    });
    if (existing) {
      return NextResponse.json({ message: 'SKU ou Nome do produto já existe.' }, { status: 409 });
    }

    // 4. Criar o Produto no Catálogo
    const newProduct = await prisma.productCatalog.create({
      data: {
        name,
        sku,
        description,
        basePrice,
      },
    });

    return NextResponse.json({ message: 'Produto adicionado ao catálogo com sucesso!', product: newProduct }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Create Product API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}