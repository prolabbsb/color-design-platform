// src/components/ui/PasswordInput.tsx
'use client';
import { useState, type InputHTMLAttributes, type ChangeEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// 1. Definimos as nossas props customizadas
interface CustomProps {
  value: string;
  onChange: (value: string) => void;
}

// 2. Pegamos as props nativas do Input, OMITINDO as que vamos substituir
type NativeProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>;

// 3. Nossas props finais são a união das duas
type PasswordInputProps = CustomProps & NativeProps;

export default function PasswordInput({ value, onChange, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Criamos um handler interno que converte o "evento" em uma "string"
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value); // Chama a função do pai apenas com o valor
  };

  return (
    <div className="relative">
      <input
        {...props} // Passa o resto das props (placeholder, required, etc.)
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={handleChange} // Usa o nosso handler
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-orange focus:border-brand-orange"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}