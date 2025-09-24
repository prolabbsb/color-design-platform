// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email({ message: 'E-mail inválido.' }),
  password: z.string().min(1, { message: 'A senha é obrigatória.' }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
  
    
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(user.password)
    const hashPass = user.password.replace(/\\/g, '');

    console.log(hashPass)
    if (!user || !(await bcrypt.compare(password, hashPass))) {
      return NextResponse.json({ message: 'Credenciais inválidas.' }, { status: 401 });
    }

    // --- ALTERAÇÃO AQUI ---
    // Agora incluímos a 'role' E o 'status' no payload do token
    const token = jwt.sign(
      { userId: user.id, role: user.role, status: user.status },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '7d' }
    );

    const cookieStore = cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Também retornamos a role E o status para o frontend
    return NextResponse.json({ 
      message: 'Login bem-sucedido!', 
      role: user.role,
      status: user.status // Retorna o status
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0]?.message || 'Dados inválidos.';
      return NextResponse.json({ message: firstError }, { status: 400 });
    }
    console.error('Login API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}