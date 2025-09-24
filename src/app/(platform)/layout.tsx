// src/app/(platform)/layout.tsx
import Sidebar from '@/components/dashboard/Sidebar';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { UserProvider, UserSessionPayload } from '@/context/UserContext';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import PageTransition from '@/components/layout/PageTransition'; // 1. Importar

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// ... (Função async function getUser() - sem alteração) ...
async function getUser(): Promise<UserSessionPayload> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  if (!tokenCookie) redirect('/');
  let payload;
  try {
    const verified = await jwtVerify(tokenCookie.value, JWT_SECRET);
    payload = verified.payload as { userId: string, role: Role, status: string };
  } catch (e) {
    redirect('/');
  }
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { office: { select: { name: true } } }
  });
  if (!user) redirect('/'); 
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    architectRole: user.architectRole,
    officeName: user.office?.name || null, 
  };
}


export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <UserProvider user={user}>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar /> 
        <main className="flex-1 p-8 overflow-auto">
          {/* 2. Envolver o 'children' com o PageTransition */}
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </UserProvider>
  );
}