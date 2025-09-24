// src/app/(auth)/layout.tsx
import Image from 'next/image';
import PageTransition from '@/components/layout/PageTransition'; // 1. Importar

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-start p-8 pt-20 pb-20
                 bg-gradient-to-br from-brand-blue to-brand-pink overflow-y-auto"
    >
      <div className="text-center mb-8">
        <Image
          src="/LOGO_COLOR_NOVA.jpeg"
          alt="Color Design Logo"
          width={180}
          height={180}
          className="mx-auto mb-4 rounded-full shadow-lg"
        />
        <h1 className="font-display text-4xl font-bold tracking-wider text-brand-black drop-shadow-md">
          COLOR DESIGN
        </h1>
        <p className="font-body text-sm text-gray-800 mt-1 drop-shadow-sm">
          Entre curvas e cores, um universo de possibilidades.
        </p>
      </div>
      
      {/* 2. Envolver o 'children' com o PageTransition */}
      <PageTransition>
        {children}
      </PageTransition>
      
    </main>
  );
}