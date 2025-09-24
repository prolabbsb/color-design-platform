// src/app/(platform)/admin/users/page.tsx
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { AccountStatus } from '@prisma/client';
import CreateUserModal from '@/components/admin/CreateUserModal';
import EditUserModal from '@/components/admin/EditUserModal';
import UserStatusActions from '@/components/admin/UserStatusActions'; // 1. IMPORTAR

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    // Incluímos o Escritório agora, pois precisamos dele para a tabela
    include: {
      office: {
        select: { name: true }
      }
    }
  });
  return users;
}

// Mapeamento de estilos para os Status
const statusStyles: Record<AccountStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-red-100 text-red-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
};

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-pink">Gestão de Usuários</h1>
          <p className="mt-2 text-gray-600 font-body">
            Aprove, suspenda ou gerencie parceiros e administradores da plataforma.
          </p>
        </div>
        <CreateUserModal /> 
      </div>

      <div className="mt-4 bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário / Escritório</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CAU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status da Conta</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.office?.name || user.email}</div>
                </td>
                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.cau || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === 'ADMIN' ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-pink/20 text-brand-pink">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brand-blue/20 text-brand-blue">
                      Arquiteto
                    </span>
                  )}
                </td>
                {/* 2. NOVA COLUNA DE STATUS */}
                <td className="px-6 py-4 whitespace-nowrap">
                   <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[user.status]}`}>
                    {user.status === 'PENDING_APPROVAL' ? 'Pendente' : (user.status === 'ACTIVE' ? 'Ativo' : 'Inativo')}
                  </span>
                </td>
                {/* 3. COLUNA DE AÇÕES ATUALIZADA */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex gap-2 justify-end">
                  <EditUserModal user={user} />
                  <UserStatusActions user={{ id: user.id, status: user.status }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}