#!/bin/bash

# Verificar se o arquivo .env existe
if [ ! -f .env ]; then
  echo "Criando arquivo .env a partir do exemplo..."
  cp .env.example .env
  echo "AVISO: Um arquivo .env foi criado com valores padrão. Você pode editá-lo depois se necessário."
  echo "Continuando com a instalação..."
fi

# Instalar dependências
echo "Instalando dependências..."
npm install

# Instalar explicitamente o ts-node-dev se ainda não estiver no package.json
if ! grep -q "ts-node-dev" package.json; then
  echo "Instalando ts-node-dev como dependência de desenvolvimento..."
  npm install --save-dev ts-node-dev
fi

# Gerar o cliente Prisma
echo "Gerando cliente Prisma..."
npx prisma generate

# Verificar se o banco de dados está disponível antes de tentar as migrações
echo "Verificando conexão com o banco de dados..."
npx prisma db push --skip-generate || {
  echo "ERRO: Não foi possível conectar ao banco de dados."
  echo "Verifique se o PostgreSQL está em execução e se as credenciais no arquivo .env estão corretas."
  echo "Se estiver usando Docker, execute 'docker-compose up -d postgres' no diretório raiz."
  exit 1
}

# Executar migrações do banco de dados
echo "Aplicando migrações do banco de dados..."
npx prisma migrate deploy

# Popular o banco de dados com dados iniciais (opcional)
read -p "Deseja popular o banco de dados com dados iniciais? (S/n) " response
if [[ "$response" != "n" && "$response" != "N" ]]; then
  echo "Populando o banco de dados..."
  npx prisma db seed
fi

echo "Configuração concluída! Execute 'npm run dev' para iniciar o servidor em modo de desenvolvimento."
