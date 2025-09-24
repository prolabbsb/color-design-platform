// src/app/api/admin/create-user/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Role, ArchitectOfficeRole, ContactType } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

async function getRequesterRole(): Promise<Role | null> {
  // ... (mesma função de verificação)
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    return (payload as { role: Role }).role;
  } catch (e) {
    return null;
  }
}

// O schema agora espera o userData E os dados do escritório (se for Arquiteto)
const newUserSchema = z.object({
  userData: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    cau: z.string().optional().nullable(),
    role: z.nativeEnum(Role),
  }),
  officeData: z.object({
    name: z.string(),
    cnpj: z.string(),
    email: z.string().email(),
    phone: z.string(),
  }).optional(), // Os dados do escritório são opcionais (só necessários se a role for ARCHITECT)
});

export async function POST(request: Request) {
  try {
    if (await getRequesterRole() !== 'ADMIN') {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json();
    const { userData, officeData } = newUserSchema.parse(body);

    // 1. Validar lógica de negócio
    if (userData.role === 'ARCHITECT' && !officeData) {
      return NextResponse.json({ message: 'Dados do escritório são obrigatórios ao criar um Arquiteto Gestor.' }, { status: 400 });
    }

    // 2. Verificar duplicidade (Email, CAU, CNPJ)
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email: userData.email }, { cau: userData.cau ? userData.cau : undefined }] }
    });
    if (existingUser) {
      return NextResponse.json({ message: 'E-mail ou CAU já está em uso.' }, { status: 409 });
    }
    if (officeData && officeData.cnpj) {
        const existingOffice = await prisma.office.findUnique({ where: { cnpj: officeData.cnpj } });
        if (existingOffice) {
            return NextResponse.json({ message: 'Este CNPJ já está em uso por outro escritório.' }, { status: 409 });
        }
    }
    
    // 3. Hash da Senha
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 4. Criar o Utilizador (e o Escritório, se necessário) numa Transação
    const newUser = await prisma.$transaction(async (tx) => {
        let newOfficeId: string | null = null;

        // Se for Arquiteto, CRIE o Escritório primeiro
        if (userData.role === 'ARCHITECT' && officeData) {
            const newOffice = await tx.office.create({
                data: {
                    name: officeData.name,
                    cnpj: officeData.cnpj,
                    contacts: { // Salva na tabela de contatos correta
                        create: [
                            { type: ContactType.EMAIL_MAIN, value: officeData.email },
                            { type: ContactType.PHONE_MAIN, value: officeData.phone }
                        ]
                    }
                }
            });
            newOfficeId = newOffice.id;
        }

        // Criar o Utilizador
        const user = await tx.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            cau: userData.cau || null,
            status: 'ACTIVE', // Admin cria utilizadores já ativos
            architectRole: userData.role === 'ARCHITECT' ? 'MANAGER' : null, // Se é Arquiteto, é Gestor
            officeId: newOfficeId, // Vincula ao escritório recém-criado (ou null se for Admin)
          },
        });
        return user;
    });

    return NextResponse.json({ message: 'Usuário criado com sucesso!', user: newUser }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Create User API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}