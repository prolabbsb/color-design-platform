#!/bin/bash

# Cores para o output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Iniciando a configuração do ambiente para a Plataforma Color Design...${NC}"

# Passo 1: Instalar dependências do Node.js
echo -e "\n${YELLOW}Passo 1/4: Instalando dependências do NPM...${NC}"
npm install

# Passo 2: Configurar variáveis de ambiente
echo -e "\n${YELLOW}Passo 2/4: Configurando o arquivo de ambiente (.env)...${NC}"
if [ ! -f .env.example ]; then
    echo -e "${YELLOW}Aviso: Arquivo .env.example não encontrado. Criando .env vazio.${NC}"
    touch .env
else
    if [ ! -f .env ]; then
        cp .env.example .env
    fi
fi
echo -e "${GREEN}Arquivo .env pronto. Lembre-se de configurar suas variáveis (especialmente a DATABASE_URL).${NC}"


# Passo 3: Gerar o cliente do Prisma
echo -e "\n${YELLOW}Passo 3/4: Gerando o cliente Prisma...${NC}"
npx prisma generate

# Passo 4: Rodar as migrações do banco de dados
echo -e "\n${YELLOW}Passo 4/4: Aplicando migrações do banco de dados...${NC}"
npx prisma migrate dev --name init

echo -e "\n${GREEN}🚀 Configuração concluída!${NC}"
echo -e "Para iniciar o servidor de desenvolvimento, execute o comando:"
echo -e "${YELLOW}npm run dev${NC}\n"