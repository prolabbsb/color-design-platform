// src/components/architect/ExportCSVButton.tsx
'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { unparse } from 'papaparse'; // Importa a função de conversão

export default function ExportCSVButton() {
  const [isLoading, setIsLoading] = useState(false);

  // Função que busca os dados, formata, e baixa o CSV
  const handleExport = async () => {
    setIsLoading(true);
    
    try {
      // 1. Buscar os dados da nossa nova API
      const response = await fetch('/api/architect/indications-report');
      if (!response.ok) {
        throw new Error('Falha ao buscar dados para o relatório.');
      }
      const data = await response.json();
      
      if (data.length === 0) {
        alert('Nenhuma indicação para exportar.');
        setIsLoading(false);
        return;
      }

      // 2. Formatar os dados (achatando o JSON)
      const formattedData = data.map((ind: any) => ({
        'ID_Projeto': ind.id,
        'Data_Criacao': new Date(ind.createdAt).toLocaleDateString('pt-BR'),
        'Status_Projeto': ind.status,
        'Valor_Projeto': ind.projectValue,
        'RT_Solicitada_%': ind.requestedCommissionPercentage,
        'Cliente_Nome': ind.client.name,
        'Cliente_Email': ind.client.contacts.find((c: any) => c.type === 'EMAIL_MAIN')?.value || 'N/A',
        'Cliente_Endereco': ind.client.addresses[0] ? `${ind.client.addresses[0].street}, ${ind.client.addresses[0].city}` : 'N/A',
        'Status_Comissao': ind.commission?.status || 'N/A',
        'Valor_Comissao': ind.commission?.amount || 'N/A',
        'Data_Pagamento_Comissao': ind.commission?.paidAt ? new Date(ind.commission.paidAt).toLocaleDateString('pt-BR') : 'N/A',
      }));

      // 3. Converter o JSON formatado para CSV
      const csv = unparse(formattedData, {
        header: true,
        delimiter: ';', // Usar ponto-e-vírgula para melhor compatibilidade com Excel em PT-BR
      });

      // 4. Criar e acionar o download no navegador
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', 'relatorio_indicacoes_colordesign.csv');
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error: any) {
      console.error(error);
      alert(`Erro ao exportar: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:bg-gray-300"
    >
      <Download size={16} />
      {isLoading ? 'Gerando...' : 'Exportar CSV'}
    </button>
  );
}