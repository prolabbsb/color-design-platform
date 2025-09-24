// src/components/admin/CreateProductModal.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import PasswordInput from '@/components/ui/PasswordInput'; // Vamos precisar do Input

// Helper de Input (para os campos normais)
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
// Helper de Textarea
function TextArea({ label, value, onChange, placeholder = '' }: { label: string, value: string, onChange: (value: string) => void, placeholder?: string }) {
  return (
     <div>
      <label className="font-body text-sm font-medium text-gray-700">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
        rows={3}
      />
    </div>
  )
}


export default function CreateProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Estados do formulário
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName(''); setSku(''); setDescription(''); setBasePrice('');
    setError(null); setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const response = await fetch('/api/admin/products/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, sku, description, basePrice }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      resetForm();
      router.refresh(); // Atualiza a tabela na página de produtos
      setTimeout(() => setIsOpen(false), 1500); 
    } else {
      setError(data.message || 'Falha ao criar produto.');
      setIsLoading(false); // Manter o modal aberto e mostrar o erro
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 transition-opacity"
      >
        <Plus size={16} />
        Adicionar Produto
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
            
            <button
              onClick={() => { setIsOpen(false); resetForm(); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>
            
            <h2 className="font-display text-xl font-bold text-brand-black mb-6">Adicionar Produto ao Catálogo</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nome do Produto (Ex: Painel Ripado V3)" value={name} onChange={setName} required />
              <Input label="SKU (Código Único, Opcional)" value={sku} onChange={setSku} />
              <TextArea label="Descrição (Opcional)" value={description} onChange={setDescription} />
              <Input label="Preço Base (Opcional, ex: 1500.00)" type="number" value={basePrice} onChange={setBasePrice} />
              
              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
              {error && <p className="text-sm text-brand-red text-center">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400">
                  {isLoading ? 'Salvando...' : 'Salvar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}