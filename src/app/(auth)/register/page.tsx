// src/app/(auth)/register/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PasswordInput from '@/components/ui/PasswordInput'; // Importamos o componente de senha

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

export default function RegisterPage() {
  const router = useRouter();
  // Estado para todos os campos do formulário
  const [userData, setUserData] = useState({ name: '', email: '', password: '', cau: '' });
  const [officeData, setOfficeData] = useState({ name: '', cnpj: '', street: '', city: '', state: '', zipCode: '' });
  const [officeEmail, setOfficeEmail] = useState('');
  const [officePhone, setOfficePhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Estados para feedback
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Estado de carregamento

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError("Você deve aceitar os Termos do Contrato para continuar.");
      return;
    }
    
    setIsLoading(true); // Ativa o carregamento
    setError(null);

    const payload = {
      userData: {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        cau: userData.cau,
      },
      officeData: officeData,
      contactData: [
        { type: 'EMAIL_MAIN', value: officeEmail },
        { type: 'PHONE_MAIN', value: officePhone }
      ]
    };

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Sucesso! Redireciona para a próxima página
        router.push('/register/success'); 
      } else {
        // Erro da API (ex: email duplicado)
        setError(data.message || 'Falha ao registrar.');
        setIsLoading(false); // Desativa o carregamento no erro
      }
    } catch (e) {
      // Erro de rede (servidor offline, etc)
      setError('Não foi possível conectar ao servidor.');
      setIsLoading(false); // Desativa o carregamento na falha
    }
    // Não desativamos o loading no sucesso, pois a página irá redirecionar
  };

  return (
    // Removemos o scroll interno (da Resposta 95)
    <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-8">
      <h2 className="font-display text-2xl text-center text-brand-pink mb-6">
        Adesão ao Programa de Parceria
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <fieldset className="border p-4 rounded-md">
          <legend className="font-display text-lg font-medium px-2">Dados de Acesso (Profissional)</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Seu Nome Completo" value={userData.name} onChange={(v) => setUserData(d => ({...d, name: v}))} required />
            <Input label="Seu E-mail de Acesso (Login)" type="email" value={userData.email} onChange={(v) => setUserData(d => ({...d, email: v}))} required />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
             <div>
                <label className="font-body text-sm font-medium text-gray-700">Crie uma Senha</label>
                <PasswordInput
                  value={userData.password}
                  onChange={(v) => setUserData(d => ({...d, password: v}))}
                  required
                  placeholder="Mínimo 6 caracteres"
                />
             </div>
            <Input label="Nº do seu Registro CAU" value={userData.cau} onChange={(v) => setUserData(d => ({...d, cau: v}))} required />
          </div>
        </fieldset>

        <fieldset className="border p-4 rounded-md">
          <legend className="font-display text-lg font-medium px-2">Dados do Escritório (Para o Contrato)</legend>
          <div className="space-y-4">
            <Input label="Nome do Escritório / Razão Social" value={officeData.name} onChange={(v) => setOfficeData(d => ({...d, name: v}))} required />
            <Input label="CPF / CNPJ" value={officeData.cnpj} onChange={(v) => setOfficeData(d => ({...d, cnpj: v}))} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Input label="E-mail Comercial (para Contato)" type="email" value={officeEmail} onChange={setOfficeEmail} required />
               <Input label="Telefone Comercial (com DDD)" type="tel" value={officePhone} onChange={setOfficePhone} required />
            </div>
            <Input label="Endereço (Rua, Nro)" value={officeData.street} onChange={(v) => setOfficeData(d => ({...d, street: v}))} required />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="Cidade" value={officeData.city} onChange={(v) => setOfficeData(d => ({...d, city: v}))} required />
              <Input label="Estado (UF)" value={officeData.state} onChange={(v) => setOfficeData(d => ({...d, state: v}))} required />
              <Input label="CEP" value={officeData.zipCode} onChange={(v) => setOfficeData(d => ({...d, zipCode: v}))} required />
            </div>
          </div>
        </fieldset>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="h-4 w-4 text-brand-pink focus:ring-brand-pink border-gray-300 rounded"
          />
          <label htmlFor="terms" className="font-body text-sm text-gray-700">
            Eu li e aceito os <a href="#" className="underline text-brand-pink">Termos do Contrato de Adesão</a>.
          </label>
        </div>
        
        {error && <p className="text-sm text-brand-red text-center">{error}</p>}

        <button
          type="submit"
          disabled={isLoading || !agreedToTerms}
          className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-bold text-brand-black bg-brand-cta hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Enviando...' : 'Finalizar Adesão'}
        </button>
      </form>
    </div>
  );
}