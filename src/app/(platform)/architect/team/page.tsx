// src/app/(platform)/architect/team/page.tsx
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import { ArchitectOfficeRole } from '@prisma/client';
import InviteCollaboratorModal from '@/components/architect/InviteCollaboratorModal';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// --- FUNÇÃO GETTEAMDATA CORRIGIDA ---
async function getTeamData() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  if (!tokenCookie) redirect('/');

  let payload;
  try {
    const { payload: tokenPayload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    payload = tokenPayload as { userId: string }; // Só confiamos no userId
  } catch (e) {
    redirect('/');
  }

  // AGORA, BUSCAMOS OS DADOS FRESCOS DO UTILIZADOR NO BANCO
  const manager = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      architectRole: true,
      officeId: true,
    }
  });

  // Verificação de segurança (Gestor) com dados FRESCOS
  if (!manager || manager.architectRole !== 'MANAGER') {
    redirect('/architect/dashboard');
  }

  // Verificação de segurança (Escritório) com dados FRESCOS
  if (!manager.officeId) { 
    // Se isto acontecer agora, é um erro de dados real
    console.error("Este Gestor não tem um officeId!");
    redirect('/architect/dashboard'); 
  }

  // A lógica de busca da equipa está correta
  const team = await prisma.user.findMany({
    where: { officeId: manager.officeId },
    orderBy: { createdAt: 'asc' },
  });

  return team;
}

const roleStyles: Record<ArchitectOfficeRole, string> = {
  MANAGER: 'bg-brand-pink/20 text-brand-pink',
  COLLABORATOR: 'bg-brand-blue/20 text-brand-blue',
};

export default async function ArchitectTeamPage() {
  const team = await getTeamData();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-pink">Gestão da Minha Equipe</h1>
          <p className="mt-2 text-gray-600 font-body">
            Convide e gerencie os arquitetos colaboradores do seu escritório.
          </p>
        </div>
        <InviteCollaboratorModal />
      </div>

      <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CAU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função no Escritório</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {team.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.cau || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* A verificação de null (!) é segura por causa do filtro na query */}
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleStyles[user.architectRole!]}`}>
                    {user.architectRole === 'MANAGER' ? 'Gestor' : 'Colaborador'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-brand-orange hover:text-brand-orange/80">Editar</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}