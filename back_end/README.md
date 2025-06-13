# BiblioTech API

API para gestão de biblioteca desenvolvida com Node.js, Express, TypeScript e Prisma.

## Requisitos

- Node.js v16+
- npm v8+
- Docker e Docker Compose (opcional, para execução em contêineres)
- PostgreSQL (se não estiver usando Docker)

## Configuração Rápida com Docker

A maneira mais simples de iniciar o projeto é usando Docker:

```bash
# Clone o repositório (se ainda não tiver feito)
git clone <seu-repositorio>
cd BiblioTech

# Inicie a aplicação com Docker Compose
docker-compose up -d
```

Acesse a documentação Swagger em: http://localhost:3000/api-docs

## Configuração Manual

1. **Configuração do ambiente**

```bash
# Entre no diretório do back-end
cd back_end

# Crie um arquivo .env baseado no exemplo
cp .env.example .env

# Edite o arquivo .env conforme necessário
nano .env
```

2. **Instalação e Execução**

```bash
# Instale as dependências
npm install

# Gere o cliente Prisma
npx prisma generate

# Execute as migrações do banco de dados
npx prisma migrate deploy

# (Opcional) Popular o banco de dados com dados iniciais
npx prisma db seed

# Inicie o servidor de desenvolvimento
npm run dev
```

3. **Acesso**

Acesse a documentação Swagger em: http://localhost:3000/api-docs

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor em modo desenvolvimento com recarga automática
- `npm run build` - Compila o código TypeScript
- `npm run start` - Inicia o servidor a partir do código compilado
- `npm run db:migrate` - Aplica migrações pendentes
- `npm run db:seed` - Popula o banco de dados com dados iniciais
- `npm run db:reset` - Reseta o banco de dados (cuidado: apaga todos os dados)
- `npm run db:studio` - Abre o Prisma Studio para visualizar o banco de dados
- `npm run setup` - Configura o projeto (instala dependências, migra e semeia o banco)

## Fluxo de Teste

Para testar a API, consulte o guia completo em `/testing-guide.txt` ou acesse a documentação Swagger.
