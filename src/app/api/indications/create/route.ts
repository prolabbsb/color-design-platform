// src/app/api/indications/create/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { ContactType } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getRequesterId(): Promise<string | null> {
  // ... (mesma função helper)
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { userId: string }).userId;
  } catch (e) {
    return null;
  }
}

// Schema de validação ATUALIZADO
const indicationSchema = z.object({
  clientData: z.object({
    name: z.string().min(3),
    document: z.string().optional(),
  }),
  addressData: z.object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(8),
  }),
  contactData: z.array(z.object({
    type: z.nativeEnum(ContactType),
    value: z.string().min(1),
  })).min(1),
  
  // --- CAMPO ADICIONADO AO SCHEMA ---
  requestedCommissionPercentage: z.coerce.number().min(0).optional().nullable(), // Coerce transforma string vazia ou número em tipo numérico
  
  projectValue: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? null : Number(val),
    z.number().nullable()
  ),
});

export async function POST(request: Request) {
  try {
    const architectId = await getRequesterId();
    if (!architectId) {
      return NextResponse.json({ message: 'Acesso não autorizado.' }, { status: 401 });
    }

    const body = await request.json();
    // 1. Validar o novo payload (incluindo o % de RT)
    const { clientData, addressData, contactData, projectValue, requestedCommissionPercentage } = indicationSchema.parse(body);

    // ... (Lógica de verificação de cliente existente - sem alteração) ...
    const primaryEmail = contactData.find(c => c.type === 'EMAIL_MAIN')?.value;
    if (!primaryEmail) {
       return NextResponse.json({ message: 'Um E-mail Principal é obrigatório.' }, { status: 400 });
    }
    let existingClient = await prisma.client.findFirst({
        where: { contacts: { some: { type: 'EMAIL_MAIN', value: primaryEmail } } }
    });
    let clientId: string;
    if (existingClient) {
      clientId = existingClient.id;
    } else {
      const newClient = await prisma.client.create({
        data: {
          ...clientData,
          addresses: { create: [addressData] },
          contacts: { create: contactData.map(c => ({...c})) },
        },
      });
      clientId = newClient.id;
    }

    // 2. Criar a Indicação (Projeto) com o novo campo de comissão
    const newIndication = await prisma.indication.create({
      data: {
        projectValue,
        requestedCommissionPercentage, // <-- CAMPO SALVO AQUI
        architectId: architectId,
        clientId: clientId,
      },
    });

    return NextResponse.json({ message: 'Indicação criada com sucesso!', indication: newIndication }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Create Indication API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}