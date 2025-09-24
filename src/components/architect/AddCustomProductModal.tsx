// src/components/architect/AddCustomProductModal.tsx
'use client';
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PlusSquare, UploadCloud } from 'lucide-react';
import { UsageRights } from '@prisma/client'; // Importamos o Enum

interface AddCustomProductModalProps {
  indicationId: string;
}

export default function AddCustomProductModal({ indicationId }: AddCustomProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Estados do formulário
  const [productName, setProductName] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null); // Estado para o ficheiro
  const [usageRights, setUsageRights] = useState<UsageRights>(UsageRights.INTERNAL_USE_ONLY); // Metadado
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setProductName(''); setNotes(''); setFile(null);
    setUsageRights(UsageRights.INTERNAL_USE_ONLY);
    setError(null); setSuccess(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um ficheiro de projeto (SKP, DWG, etc).');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // 1. Construir o FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('indicationId', indicationId);
    formData.append('productName', productName);
    formData.append('notes', notes);
    formData.append('usageRights', usageRights);

    // 2. Enviar para a "API Ponte"
    const response = await fetch('/api/architect/add-custom-product', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      resetForm();
      router.refresh(); // Atualiza a lista de produtos na página
      setTimeout(() => setIsOpen(false), 1500);
    } else {
      setError(data.message || 'Falha ao adicionar produto.');
    }
    setIsLoading(false);
  };

  return (
    <>
      {/* Botão de abrir o modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <PlusSquare size={16} />
        Adicionar Customizado (com Ficheiro)
      </button>

      {/* O Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
            <button onClick={() => { setIsOpen(false); resetForm(); }} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">&times;</button>
            <h2 className="font-display text-xl font-bold text-brand-black mb-6">Adicionar Produto Customizado</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Nome do Produto Customizado (ex: 'Estante Sala')" value={productName} onChange={setProductName} required />
              
              {/* Input do Ficheiro Real */}
              <div>
                <label className="font-body text-sm font-medium text-gray-700">Ficheiro do Projeto (SKP, DWG, etc.)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  required
                  className="mt-1 block w-full text-sm text-gray-500
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-md file:border-0
                             file:text-sm file:font-semibold
                             file:bg-brand-pink/10 file:text-brand-pink
                             hover:file:bg-brand-pink/20"
                />
              </div>

              {/* Input dos Metadados (Direitos de Uso) */}
              <div>
                <label className="font-body text-sm font-medium text-gray-700">Direitos de Uso (Obrigatório)</label>
                <select
                  value={usageRights}
                  onChange={(e) => setUsageRights(e.target.value as UsageRights)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="INTERNAL_USE_ONLY">Apenas Uso Interno</option> 
                  <option value="PORTFOLIO">Permitir Uso no Portfólio</option>
                  <option value="MARKETING">Permitir Uso em Marketing</option>
                </select>
              </div>
              
              <TextArea label="Notas ou observações (opcional)" value={notes} onChange={setNotes} />

              {success && <p className="text-sm text-green-600 text-center">{success}</p>}
              {error && <p className="text-sm text-brand-red text-center">{error}</p>}

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
                  Cancelar
                </button>
                <button type="submit" disabled={isLoading || !file} className="px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400">
                  <UploadCloud size={16} className="mr-2" />
                  {isLoading ? 'Enviando...' : 'Enviar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// --- Helpers de Input (para reutilização) ---
function Input({ label, type = 'text', value, onChange, required = false }: { label: string, type?: string, value: string, onChange: (value: string) => void, required?: boolean }) {
  return (
    <div>
      <label className="font-body text-sm font-medium text-gray-700 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
      />
    </div>
  );
}
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