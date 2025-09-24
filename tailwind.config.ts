// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': {
          DEFAULT: '#F45A5A',
          400: '#F77D7D', // Exemplo para um tom mais claro
          500: '#F45A5A', // O padrão
        },
        'brand-blue': {
          DEFAULT: '#38C7E3',
          400: '#6AD3EE', // Tom para o gradiente
          500: '#38C7E3', // O padrão
        },
        'brand-orange': {
          DEFAULT: '#F47B20',
          400: '#F79D55',
          500: '#F47B20',
        },
        'brand-pink': {
          DEFAULT: '#C930A5',
          400: '#DE64CE', // Tom para o gradiente
          500: '#C930A5', // O padrão
        },
        'brand-cta': {
          DEFAULT: '#66E500',
          400: '#99EE4C',
          500: '#66E500',
        },
        'brand-black': '#000000',
      },
      fontFamily: {
        'display': ['var(--font-oswald)'],
        'body': ['var(--font-montserrat)'],
      },
    },
  },
  plugins: [],
};
export default config;