// src/components/admin/CreateUserModal.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import PasswordInput from '@/components/ui/PasswordInput'; // 1. IMPORTAR O NOVO COMPONENTE

export default function CreateUserModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Estados do formulário
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cau, setCau] = useState('');
  const [role, setRole] = useState('ARCHITECT'); // Padrão
  
  // Novos estados para os dados do escritório
  const [officeName, setOfficeName] = useState('');
  const [officeCnpj, setOfficeCnpj] = useState('');
  const [officeEmail, setOfficeEmail] = useState('');
  const [officePhone, setOfficePhone] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setCau(''); setRole('ARCHITECT');
    setOfficeName(''); setOfficeCnpj(''); setOfficeEmail(''); setOfficePhone('');
    setError(null); setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Montar o payload aninhado que a nova API espera
    const payload: any = {
      userData: { name, email, password, cau, role }
    };
    
    // Só adicionar dados do escritório se for um arquiteto
    if (role === 'ARCHITECT') {
      payload.officeData = {
        name: officeName,
        cnpj: officeCnpj,
        email: officeEmail,
        phone: officePhone
      };
    }

    const response = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      resetForm();
      router.refresh(); 
      setTimeout(() => setIsOpen(false), 1500); 
    } else {
      setError(data.message || 'Falha ao criar usuário.');
    }
    setIsLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 transition-opacity"
      >
        <Plus size={16} />
        Novo Usuário
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => { setIsOpen(false); resetForm(); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
            <h2 className="font-display text-xl font-bold text-brand-black mb-6">Criar Novo Usuário</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <fieldset className="border p-4 rounded-md">
                <legend className="font-display text-lg font-medium px-2">Dados de Acesso</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Função (Role)" value={role} onChange={setRole} selectOptions={[{value: 'ARCHITECT', label: 'Arquiteto (Gestor)'}, {value: 'ADMIN', label: 'Administrador'}]} />
                  <Input label="Nome Completo" value={name} onChange={setName} required />
                  <Input label="E-mail (Login)" type="email" value={email} onChange={setEmail} required />
<div>
                    <label className="font-body text-sm font-medium text-gray-700">Senha Provisória</label>
                    <PasswordInput
                      value={password}
                      onChange={setPassword}
                      required
                    />
                  </div>                  {role === 'ARCHITECT' && (
                     <Input label="Nº Registro CAU (Opcional)" value={cau} onChange={setCau} />
                  )}
                </div>
              </fieldset>

              {/* Seção Condicional: Só aparece se for Arquiteto */}
              {role === 'ARCHITECT' && (
                <fieldset className="border p-4 rounded-md">
                  <legend className="font-display text-lg font-medium px-2">Dados do Escritório (Obrigatório)</legend>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Input label="Nome do Escritório / Razão Social" value={officeName} onChange={setOfficeName} required />
                     <Input label="CPF / CNPJ" value={officeCnpj} onChange={setOfficeCnpj} required />
                     <Input label="E-mail Comercial (Contato)" type="email" value={officeEmail} onChange={setOfficeEmail} required />
                     <Input label="Telefone Comercial" type="tel" value={officePhone} onChange={setOfficePhone} required />
                   </div>
                </fieldset>
              )}

              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
              {error && <p className="text-sm text-brand-red text-center">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400">
                  {isLoading ? 'Criando...' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Helper de Input Atualizado (para suportar <select>)
function Input({ label, type = 'text', value, onChange, required = false, selectOptions }: { label: string, type?: string, value: string, onChange: (value: string) => void, required?: boolean, selectOptions?: {value: string, label: string}[] }) {
  const commonClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm";
  
  if (selectOptions) {
    return (
      <div>
        <label className="font-body text-sm font-medium text-gray-700 block">{label}</label>
        <select value={value} onChange={(e) => onChange(e.target.value)} className={commonClasses}>
          {selectOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    );
  }
  
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={commonClasses}
      />
    </div>
  );
}