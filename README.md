# Plataforma de Parcerias - Color Design

Esta é a aplicação web para a gestão de arquitetos parceiros, projetos, orçamentos e comissões da Color Design, construída com Next.js, Prisma, PostgreSQL e Tailwind CSS. A implantação é gerida via Docker.

## Pré-requisitos do Servidor

Antes de começar, garanta que o servidor VPS do cliente tem o seguinte software instalado:
* **Git**
* **Docker**
* **Docker Compose**

## Guia de Instalação e Deploy

Siga estes passos para configurar e executar a aplicação num novo ambiente de produção.

### 1. Clonar o Repositório

Conecte-se ao servidor via SSH e clone o repositório do projeto.

```bash
git clone <URL_DO_SEU_REPOSITORIO_GIT>
cd <NOME_DA_PASTA_DO_PROJETO>
```

### 2. Configurar as Variáveis de Ambiente

As credenciais e chaves da aplicação são geridas através de um ficheiro `.env`. Copie o ficheiro de exemplo para criar o seu.

```bash
cp .env.example .env
```

Agora, edite o ficheiro `.env` e preencha **todas** as variáveis:

```env
# / .env

# Base de Dados (para o contentor Docker do PostgreSQL)
# Pode escolher o utilizador, senha e nome da base de dados que quiser.
POSTGRES_DB=colordesign_db
POSTGRES_USER=colordesign_user
POSTGRES_PASSWORD=coloque_uma_senha_muito_segura_aqui

# URL de Conexão que a aplicação Next.js irá usar para se conectar à base de dados Docker
# NOTA: O host é 'db', o nome do serviço no docker-compose.yml
DATABASE_URL="postgresql://colordesign_user:coloque_a_mesma_senha_de_cima_aqui@db:5432/colordesign_db?schema=public"

# Chave Secreta para JWT (Autenticação)
# Gere uma chave segura de 32 caracteres. Pode usar o OpenSSL:
# openssl rand -base64 32
NEXTAUTH_SECRET=coloque_a_sua_chave_secreta_aqui

# Credenciais do Servidor de E-mail (SMTP) para o Nodemailer
EMAIL_HOST="smtp.seuprovedor.com"
EMAIL_PORT="465"
EMAIL_USER="seu-email@colordesign.com.br"
EMAIL_PASS="sua-senha-de-app-ou-smtp"
EMAIL_FROM_ADDRESS="nao-responda@colordesign.com.br"

# Credenciais Google Drive (do ficheiro .json da sua Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL="...gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...sua_chave...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID="ID_DA_SUA_PASTA_RAIZ_NO_DRIVE"

# URL da Aplicação (para links em e-mails, etc.)
NEXT_PUBLIC_APP_URL="http://seu_dominio_ou_ip_aqui"
```

### 3. Construir e Iniciar os Contentores Docker

Com o ficheiro `.env` configurado, podemos agora construir a imagem da sua aplicação Next.js e iniciar todos os serviços (a aplicação e a base de dados).

```bash
# Constrói a imagem da aplicação Next.js com base no Dockerfile
docker-compose build

# Inicia os contentores em modo "detached" (a correr em segundo plano)
docker-compose up -d
```

Neste ponto, a sua aplicação e a base de dados estão a ser executadas, mas a base de dados está vazia.

### 4. Executar a Migração da Base de Dados

Precisamos de criar todas as tabelas na nossa nova base de dados. Executamos o comando de migração do Prisma *dentro* do contentor da aplicação.

```bash
# O 'app' é o nome do serviço da aplicação no ficheiro docker-compose.yml
docker-compose exec app npx prisma migrate deploy
```

### 5. Criar o Primeiro Utilizador Administrador (Manual)

A base de dados está pronta, mas não tem nenhum utilizador. Precisamos de criar a sua conta "Admin Master" manualmente.

**5.1. Gerar a Hash da Senha**

Por segurança, as senhas são encriptadas. Execute este comando no seu **computador local** (que tem Node.js) para gerar a hash da sua senha. Crie um ficheiro temporário `hash-password.js`:

```javascript
// hash-password.js
const bcrypt = require('bcryptjs');
const password = process.argv[2];

if (!password) {
  console.error('Por favor, forneça uma senha. Uso: node hash-password.js "sua_senha_aqui"');
  process.exit(1);
}

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
console.log('A sua hash da senha é:');
console.log(hash);
```
Agora, no seu terminal local, execute:
```bash
# Não se esqueça de instalar o bcryptjs se não o tiver globalmente
# npm install bcryptjs
node hash-password.js "coloque_a_sua_senha_de_admin_aqui"
```
Copie a hash gerada (começa com `$2a$...`).

**5.2. Inserir o Utilizador na Base de Dados**

Volte ao terminal do seu **servidor VPS**. Execute o seguinte comando SQL para inserir o seu utilizador Admin, colando a hash que acabou de gerar.

```bash
docker-compose exec db psql -U colordesign_user -d colordesign_db -c "INSERT INTO \"cd_users\" (id, name, email, password, role, status) VALUES ('cl_admin_master_01', 'Admin Master', 'seu_email_admin@exemplo.com', 'COLE_A_HASH_DA_SENHA_AQUI', 'ADMIN', 'ACTIVE');"
```

**Pronto!** A sua plataforma está agora instalada, configurada e pronta a ser acedida no IP ou domínio do seu servidor.

## Comandos de Gestão

* **Ver os logs da aplicação:** `docker-compose logs -f app`
* **Parar todos os serviços:** `docker-compose down`
* **Reiniciar os serviços:** `docker-compose down && docker-compose up -d`
