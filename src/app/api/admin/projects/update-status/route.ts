// src/app/api/admin/projects/update-status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Role, IndicationStatus } from '@prisma/client';

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

const updateStatusSchema = z.object({
  indicationId: z.string(),
  newStatus: z.nativeEnum(IndicationStatus), // Recebe o novo status (ex: CONCLUDED)
});

export async function POST(request: Request) {
  try {
    if (await getRequesterRole() !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json();
    const { indicationId, newStatus } = updateStatusSchema.parse(body);

    // --- LÓGICA DE TRANSAÇÃO ---
    // Usamos $transaction para garantir que ambas as operações funcionem.
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Atualiza o status da Indicação/Projeto
      const updatedIndication = await tx.indication.update({
        where: { id: indicationId },
        data: { status: newStatus },
      });

      // 2. SE o novo status for "CONCLUÍDO" (projeto pago), NÓS CRIAMOS A COMISSÃO
      if (newStatus === IndicationStatus.CONCLUDED) {
        
        // Verifica se a comissão já não foi criada (evitar duplicatas)
        const existingCommission = await tx.commission.findUnique({
          where: { indicationId: indicationId },
        });

        // Só cria a comissão se ela não existir E se os valores estiverem corretos
        if (!existingCommission && updatedIndication.projectValue && updatedIndication.requestedCommissionPercentage) {
          
          // Calcula o valor da comissão
          const projectValue = Number(updatedIndication.projectValue);
          const pct = Number(updatedIndication.requestedCommissionPercentage) / 100;
          const commissionAmount = projectValue * pct;

          // Cria o registro da Comissão com status PENDENTE
          await tx.commission.create({
            data: {
              amount: commissionAmount,
              status: 'PENDING',
              indicationId: indicationId,
            },
          });
        }
      }
      
      return updatedIndication;
    });

    return NextResponse.json({ message: 'Status do projeto atualizado!', indication: result }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Update Status API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}