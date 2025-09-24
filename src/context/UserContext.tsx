// src/context/UserContext.tsx
'use client';
import { createContext, useContext, ReactNode } from 'react';
import { Role, ArchitectOfficeRole } from '@prisma/client'; // É seguro importar Tipos/Enums aqui

// A "forma" dos nossos dados de sessão
export interface UserSessionPayload {
  id: string;
  name: string; 
  email: string; 
  role: Role;
  architectRole: ArchitectOfficeRole | null;
  officeName: string | null; // O nome da "empresa"
}

const UserContext = createContext<UserSessionPayload | null>(null);

// O Provedor
export function UserProvider({ children, user }: { children: ReactNode; user: UserSessionPayload }) {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

// O Hook
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}