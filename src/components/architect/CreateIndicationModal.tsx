// src/components/architect/CreateIndicationModal.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

// Tipos para organizar o estado do formulário
interface ClientState {
  name: string;
  email: string;
  document: string;
  phone: string;
}
interface AddressState {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function CreateIndicationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Estados do formulário
  const [client, setClient] = useState<ClientState>({ name: '', email: '', document: '', phone: '' });
  const [address, setAddress] = useState<AddressState>({ street: '', city: '', state: '', zipCode: '' });
  const [projectValue, setProjectValue] = useState('');
  const [commissionPct, setCommissionPct] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- A LINHA FALTANTE ESTÁ AQUI ---
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setClient({ name: '', email: '', document: '', phone: '' });
    setAddress({ street: '', city: '', state: '', zipCode: '' });
    setProjectValue('');
    setCommissionPct('');
    setError(null);
    setSuccess(null); // Também precisa estar no reset
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null); // Resetar o sucesso no início

    const payload = {
      clientData: { name: client.name, document: client.document },
      addressData: { ...address },
      contactData: [
        { type: 'EMAIL_MAIN', value: client.email },
        { type: 'PHONE_MAIN', value: client.phone }
      ],
      projectValue,
      requestedCommissionPercentage: commissionPct
    };

    const response = await fetch('/api/indications/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message); // Definir a mensagem de sucesso
      resetForm();
      router.refresh(); 
      setTimeout(() => {
        setIsOpen(false);
        // O ID é retornado pela API (como definimos)
        const newIndicationId = data.indication.id; 
        router.push(`/architect/indications/${newIndicationId}`); // Redireciona para a página de detalhes
      }, 1500); 
    } else {
      setError(data.message || 'Falha ao criar indicação.');
      setIsLoading(false);
    }
    // Não definimos isLoading(false) no sucesso, pois a página irá redirecionar
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 transition-opacity"
      >
        <Plus size={16} />
        Novo Projeto
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => { setIsOpen(false); resetForm(); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10">
              &times;
            </button>
            
            <h2 className="font-display text-xl font-bold text-brand-black mb-6">Criar Novo Projeto (Indicação)</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <fieldset className="border p-4 rounded-md">
                <legend className="font-display text-lg font-medium px-2">Dados do Cliente</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Nome Completo do Cliente" value={client.name} onChange={(v) => setClient(c => ({...c, name: v}))} required />
                  <Input label="E-mail Principal" type="email" value={client.email} onChange={(v) => setClient(c => ({...c, email: v}))} required />
                  <Input label="Telefone Principal" type="tel" value={client.phone} onChange={(v) => setClient(c => ({...c, phone: v}))} />
                  <Input label="CPF/CNPJ (Opcional)" value={client.document} onChange={(v) => setClient(c => ({...c, document: v}))} />
                </div>
              </fieldset>

              <fieldset className="border p-4 rounded-md">
                <legend className="font-display text-lg font-medium px-2">Endereço do Cliente</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Rua / Avenida" value={address.street} onChange={(v) => setAddress(a => ({...a, street: v}))} required />
                  <Input label="Cidade" value={address.city} onChange={(v) => setAddress(a => ({...a, city: v}))} required />
                  <Input label="CEP" value={address.zipCode} onChange={(v) => setAddress(a => ({...a, zipCode: v}))} required />
                </div>
                <Input label="Estado" value={address.state} onChange={(v) => setAddress(a => ({...a, state: v}))} required />
              </fieldset>

              <fieldset className="border p-4 rounded-md">
                <legend className="font-display text-lg font-medium px-2">Dados do Projeto</legend>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Valor Estimado (Opcional)" type="number" value={projectValue} onChange={setProjectValue} />
                    <Input label="Percentual de RT Solicitado (%)" type="number" value={commissionPct} onChange={setCommissionPct} required />
                 </div>
              </fieldset>
              
              {/* O JSX que usa as variáveis de estado */}
              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
              {error && <p className="text-sm text-brand-red text-center">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400">
                  {isLoading ? 'Salvando...' : 'Salvar e Continuar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Pequeno componente helper para os inputs
function Input({ label, type = 'text', value, onChange, required = false, placeholder = '' }: { label: string, type?: string, value: string, onChange: (value: string) => void, required?: boolean, placeholder?: string }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
      />
    </div>
  );
}