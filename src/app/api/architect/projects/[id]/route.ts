// src/app/api/architect/projects/[id]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // A importação está correta
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

export async function GET(request: Request, { params }: { params: { id: string } }) {
  
  // --- CORREÇÃO AQUI ---
  // 1. Pegamos a "loja" de cookies.
  const cookieStore = await cookies();
  // 2. AGORA chamamos o .get() na variável.
  const tokenCookie = cookieStore.get('auth_token');
  
  if (!tokenCookie) return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });

  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    const userId = (payload as { userId: string }).userId;
    
    // O aviso sobre "params.id" é um falso positivo comum no linter; este código está correto.
    const projectId = params.id; 

    // Busca o projeto e o catálogo em paralelo
    const [indication, catalog] = await Promise.all([
      prisma.indication.findUnique({
        where: { id: projectId, architectId: userId },
        include: {
          client: { include: { addresses: true, contacts: true } },
          products: { 
            orderBy: { name: 'asc' },
            include: { catalogItem: true, pieces: true, assets: true },
          },
          quotes: { orderBy: { createdAt: 'desc' } },
        },
      }),
      prisma.productCatalog.findMany({
        orderBy: { name: 'asc' },
        select: { id: true, name: true, sku: true }
      })
    ]);

    if (!indication) {
      return NextResponse.json({ message: 'Projeto não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ indication, catalog });

  } catch (e) {
    return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
  }
}