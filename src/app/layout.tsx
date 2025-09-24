// src/app/layout.tsx
import { Oswald, Montserrat } from 'next/font/google';
import './globals.css';

// Configuração da fonte para títulos (Display)
const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-oswald',
});

// Configuração da fonte para textos (Body)
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-montserrat',
});

// Este é o metadata que você pediu
export const metadata = {
  title: 'Color Design',
  description: 'Plataforma de indicações e comissões para parceiros Color Design',
};

// Esta é a função que renderiza o <html> e <body>
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${oswald.variable} ${montserrat.variable} font-body`}>
        {/* O 'children' aqui será a sua página de login (src/app/page.tsx) */}
        {children}
      </body>
    </html>
  );
}