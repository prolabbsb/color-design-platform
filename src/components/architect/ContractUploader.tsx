// src/components/architect/ContractUploader.tsx
'use client';
import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import { UsageRights } from '@prisma/client';

export default function ContractUploader() {
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('Contrato de Parceria Assinado');
  const [usageRights, setUsageRights] = useState<UsageRights>(UsageRights.INTERNAL_USE_ONLY);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== 'application/pdf') {
        setError('Por favor, envie apenas ficheiros PDF.');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setDocumentName(selectedFile.name.replace('.pdf', ''));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecione um ficheiro.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentName', documentName);
    formData.append('usageRights', usageRights);
    
    const response = await fetch('/api/architect/upload-contract', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess(data.message);
      router.refresh(); 
    } else {
      setError(data.message || 'Falha ao enviar o contrato.');
      setIsLoading(false);
    }
  };

  // ESTE É O CÓDIGO JSX (HTML) QUE ESTAVA NO SEU 'route.ts'
  return (
    <div className="text-left font-body text-gray-600 space-y-4 bg-gray-50 p-6 rounded-md border-t-4 border-brand-orange">
      <h3 className="font-display text-lg font-bold text-brand-black">Enviar Contrato para Análise</h3>
      <p className="text-sm">
        Para ativar a sua conta, por favor, assine o contrato que enviámos para o seu e-mail e faça o upload do ficheiro (PDF) abaixo.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div>
          <label className="font-body text-sm font-medium text-gray-700">Ficheiro do Contrato (PDF)</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="application/pdf"
            required
            className="mt-1 block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-brand-pink/10 file:text-brand-pink
                       hover:file:bg-brand-pink/20"
          />
        </div>
        
        <div>
          <label className="font-body text-sm font-medium text-gray-700">Nome do Documento</label>
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="font-body text-sm font-medium text-gray-700">Direitos de Uso (Definido no contrato)</label>
          <select
            value={usageRights}
            onChange={(e) => setUsageRights(e.target.value as UsageRights)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
          >
            <option value="PORTFOLIO">Permitir Uso no Portfólio (Padrão)</option>
            <option value="MARKETING">Permitir Uso em Marketing (Redes Sociais)</option>
            <option value="INTERNAL_USE_ONLY">Apenas Uso Interno</option> 
          </select>
        </div>

        {success && <p className="text-sm text-green-600 text-center">{success}</p>}
        {error && <p className="text-sm text-brand-red text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || !file}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <UploadCloud size={16} />
          {isLoading ? 'Enviando...' : 'Enviar para Análise'}
        </button>
      </form>
    </div>
  );
}