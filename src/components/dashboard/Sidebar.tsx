// src/components/dashboard/Sidebar.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FileText, BarChart2, LogOut, Users, Settings, Package, Briefcase, UserCircle, Building
} from 'lucide-react'; 
import { useUser } from '@/context/UserContext'; 

// ... (definições de architectLinks, managerLink, adminLinks - sem alteração) ...
const baseArchitectLinks = [
  { href: '/architect/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/architect/indications', label: 'Meus Projetos', icon: FileText },
  { href: '/architect/reports', label: 'Relatórios', icon: BarChart2 },
];
const managerLink = { href: '/architect/team', label: 'Minha Equipe', icon: Briefcase }; 
const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Gestão de Arquitetos', icon: Users },
  { href: '/admin/products', label: 'Catálogo de Produtos', icon: Package },
  { href: '/admin/indications', label: 'Todos os Projetos', icon: FileText },
  { href: '/admin/commissions', label: 'Comissões', icon: Settings },
];


export default function Sidebar() {
  const user = useUser(); 
  const pathname = usePathname();
  const router = useRouter();

  let navLinks = [];
  if (user.role === 'ADMIN') {
    navLinks = adminLinks;
  } else if (user.role === 'ARCHITECT') {
    navLinks = [...baseArchitectLinks];
    if (user.architectRole === 'MANAGER') {
      navLinks.push(managerLink); 
    }
  }

  const handleLogout = async () => {
    // ... (lógica de logout sem alterações) ...
    const response = await fetch('/api/logout', { method: 'POST' });
    if (response.ok) {
      router.push('/');
      router.refresh();
    } else {
      alert('Falha ao fazer logout.');
    }
  };

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col flex-shrink-0">
      <div className="p-8 flex justify-center items-center border-b">
        <Image
          src="/LOGO_COLOR_NOVA.jpeg"
          alt="Color Design Logo"
          width={120}
          height={120}
          priority
        />
      </div>
      <nav className="mt-8 flex-1">
        <ul>
          {navLinks.map((link) => (
            // ... (lógica de map dos links - sem alterações) ...
             <li key={link.href} className="px-6 py-2">
              <Link
                href={link.href}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors
                  ${
                    pathname.startsWith(link.href)
                      ? 'bg-brand-pink/10 text-brand-pink font-bold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* --- BLOCO DE EXIBIÇÃO DE UTILIZADOR (CORRIGIDO) --- */}
      <div className="p-6 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {user.role === 'ADMIN' ? (
              <div className="p-2 rounded-full bg-brand-pink text-white">
                <Settings size={20} />
              </div>
            ) : (
              <div className="p-2 rounded-full bg-brand-blue text-white">
                <UserCircle size={20} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-brand-black truncate">{user.name}</p>
            
            {/* --- CORREÇÃO AQUI --- */}
            {/* Agora exibimos a Função (Gestor/Colaborador) E a Empresa (officeName) */}
            {user.role === 'ADMIN' ? (
              <p className="text-xs text-gray-500">Administrador</p>
            ) : (
              <>
              <p className="text-xs text-gray-500 truncate">
                {user.architectRole === 'MANAGER' ? 'Gestor' : 'Colaborador'}

              </p>
              <p className="text-xs text-gray-500 truncate">
     
                {user.officeName ? ` ${user.officeName}` : ''}
              </p></>
            )}
            {/* --- FIM DA CORREÇÃO --- */}

          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-4 w-full p-3 rounded-lg transition-colors 
                     font-bold text-brand-red hover:bg-brand-red/10 mt-4"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}