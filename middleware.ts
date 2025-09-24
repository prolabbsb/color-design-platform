// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { AccountStatus, Role } from '@prisma/client'; // Importamos os Enums

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

interface UserPayload {
  userId: string;
  role: Role;
  status: AccountStatus; // Nosso payload agora tem status
}

async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as UserPayload;
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get('auth_token');
  const token = tokenCookie?.value;

  const payload = token ? await verifyToken(token) : null;

  // 1. Lógica para rotas de autenticação (Login, Register, Pending)
  const authRoutes = ['/login', '/register', '/pending-approval'];
  if (authRoutes.includes(pathname)) {
    if (payload && payload.status === 'ACTIVE') {
      // Usuário ATIVO e logado tentando acessar login? Mande para o dashboard.
      const url = payload.role === 'ADMIN' ? '/admin/dashboard' : '/architect/dashboard';
      return NextResponse.redirect(new URL(url, request.url));
    }
    if (payload && payload.status === 'PENDING_APPROVAL' && pathname !== '/pending-approval') {
      // Usuário PENDENTE tentando acessar qualquer coisa? Mande para a página de pendente.
      return NextResponse.redirect(new URL('/pending-approval', request.url));
    }
    // Deixe usuários não logados acessarem essas páginas
    return NextResponse.next();
  }

  // 2. Lógica para rotas protegidas (Dashboards)
  if (pathname.startsWith('/architect') || pathname.startsWith('/admin')) {
    if (!payload) {
      // Sem token, tentando acessar rota protegida? Vá para o login.
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    // --- NOVA VERIFICAÇÃO DE STATUS ---
    if (payload.status !== 'ACTIVE') {
      // Se o usuário está PENDENTE ou INATIVO, bloqueie o acesso ao dashboard
      const dest = payload.status === 'PENDING_APPROVAL' ? '/pending-approval' : '/?error=suspended';
      const response = NextResponse.redirect(new URL(dest, request.url));
      if (payload.status === 'INACTIVE') response.cookies.delete('auth_token'); // Desloga se suspenso
      return response;
    }

    // 3. Verificação de Permissão (Role-Based Access Control)
    if (payload.role === 'ADMIN' && pathname.startsWith('/architect')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    if (payload.role === 'ARCHITECT' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/architect/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|LOGO_COLOR_NOVA.jpeg|favicon.ico).*)',
  ],
};