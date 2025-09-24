// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // --- A CORREÇÃO ESTÁ AQUI ---
    // 1. Obtenha a instância da loja de cookies primeiro.
    const cookieStore = cookies();

    // 2. Chame o método (set ou delete) na instância.
    //    Usar .set com maxAge: 0 é a forma mais robusta de garantir a exclusão.
    cookieStore.set('auth_token', '', { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expira imediatamente
    });

    return NextResponse.json({ message: 'Logout realizado com sucesso.' }, { status: 200 });

  } catch (error) {
    console.error('Logout API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}