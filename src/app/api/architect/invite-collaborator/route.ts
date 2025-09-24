// src/app/api/architect/invite-collaborator/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Role, ArchitectOfficeRole, AccountStatus } from '@prisma/client';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// Helper que busca o Usuário completo (para pegar a Role E o OfficeId)
async function getManagerData(): Promise<{ id: string, role: Role, architectRole: ArchitectOfficeRole, officeId: string } | null> {
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    const userId = (payload as { userId: string }).userId;

    // Precisamos buscar o usuário no DB para pegar seu officeId e confirmar que ele é MANAGER
    const manager = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, architectRole: true, officeId: true }
    });

    // Se ele não for um Arquiteto, ou não for um Manager, ou não tiver escritório, ele não pode convidar.
    if (!manager || manager.role !== 'ARCHITECT' || manager.architectRole !== 'MANAGER' || !manager.officeId) {
      return null;
    }
    
    return manager as any; // Cast pois já validamos os campos necessários
  
  } catch (e) {
    return null;
  }
}

// Schema para o novo Colaborador
const collaboratorSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  cau: z.string().optional().nullable(),
});


export async function POST(request: Request) {
  try {
    // 1. Segurança: O solicitante é um Manager de Escritório?
    const manager = await getManagerData();
    if (!manager) {
      return NextResponse.json({ message: 'Acesso negado. Somente gestores de escritório podem convidar usuários.' }, { status: 403 });
    }

    // 2. Validação dos dados do novo colaborador
    const body = await request.json();
    const { name, email, password, cau } = collaboratorSchema.parse(body);

    // 3. Verificar duplicidade (Email ou CAU)
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email: email }, { cau: cau ? cau : undefined }] }
    });
    if (existingUser) {
      const message = existingUser.email === email ? 'Este e-mail já está em uso.' : 'Este CAU já está cadastrado.';
      return NextResponse.json({ message }, { status: 409 });
    }

    // 4. Criar o novo Colaborador
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newCollaborator = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cau: cau || null,
        role: Role.ARCHITECT,
        architectRole: ArchitectOfficeRole.COLLABORATOR, // Definido como Colaborador
        status: AccountStatus.ACTIVE, // Criado como Ativo (sem necessidade de contrato)
        officeId: manager.officeId, // Vinculado ao escritório do Gestor
      }
    });

    return NextResponse.json({ message: 'Colaborador adicionado com sucesso!', user: newCollaborator }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    console.error('Invite Collaborator API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}