// src/components/layout/PageTransition.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // 'AnimatePresence' deteta quando um componente filho é removido da árvore
    // 'mode="wait"' espera a animação de saída terminar antes de iniciar a de entrada
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // A chave ser o pathname é o que faz o AnimatePresence detetar a mudança
        
        // Animação de Entrada
        initial={{ opacity: 0, y: 15 }} // Começa invisível e ligeiramente abaixo
        animate={{ opacity: 1, y: 0 }} // Anima para visível e na posição
        
        // Animação de Saída
        exit={{ opacity: 0, y: 15 }} // Sai para invisível e ligeiramente abaixo
        
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}