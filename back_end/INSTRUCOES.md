# Passo a Passo para Configuração do BiblioTech

## 1. Preparar o Banco de Dados PostgreSQL

Execute este comando no terminal para iniciar um container Docker com PostgreSQL:

```bash
docker run --name bibliotech-postgres -e POSTGRES_USER=bibliotech -e POSTGRES_PASSWORD=bibliotech -e POSTGRES_DB=bibliotech -p 5432:5432 -d postgres:15
```

## 2. Configurar o Arquivo de Ambiente

Copie o arquivo .env.example para .env:

```bash
cp .env.example .env
```

## 3. Instalar Dependências do Projeto

Instale os pacotes necessários:

```bash
npm install
npm install --save-dev ts-node-dev
```

## 4. Gerar o Cliente Prisma e Configurar o Banco de Dados

```bash
npx prisma generate
npx prisma migrate deploy
```

## 5. (Opcional) Popular o Banco de Dados com Dados Iniciais

```bash
npx prisma db seed
```

## 6. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em: http://localhost:3000
A documentação Swagger estará em: http://localhost:3000/api-docs

## Solução de Problemas Comuns

- Se o comando `npm run dev` falhar com erro "ts-node-dev not found", execute: `npm install --save-dev ts-node-dev`
- Se aparecer erro de conexão com o PostgreSQL, verifique se o container Docker está rodando: `docker ps`
- Para reiniciar o container do PostgreSQL: `docker restart bibliotech-postgres`
