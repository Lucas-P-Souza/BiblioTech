#!/bin/bash

echo "===== INICIANDO BIBLIOTECH ====="

# Verificar se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "ERRO: Docker não está instalado. Instale o Docker primeiro."
    exit 1
fi

# Verificar se o banco de dados já está configurado
if [ ! -f .env ] || [ ! -d node_modules ]; then
    echo "AVISO: Sistema não configurado. Execute ./setup.sh primeiro."
    read -p "Deseja executar o setup agora? (S/n) " response
    if [[ "$response" != "n" && "$response" != "N" ]]; then
        ./setup.sh
        exit $?
    else
        exit 1
    fi
fi

# Iniciar o PostgreSQL se não estiver rodando
echo "1. Verificando PostgreSQL..."
if ! docker ps | grep -q bibliotech-postgres; then
    if docker ps -a | grep -q bibliotech-postgres; then
        echo "  - Iniciando container PostgreSQL existente..."
        docker start bibliotech-postgres
    else
        echo "  - Criando novo container PostgreSQL..."
        docker run --name bibliotech-postgres -e POSTGRES_USER=bibliotech -e POSTGRES_PASSWORD=bibliotech -e POSTGRES_DB=bibliotech -p 5432:5432 -d postgres:15
    fi
    echo "  - Aguardando PostgreSQL inicializar..."
    sleep 3
fi

echo "2. Iniciando servidor BiblioTech..."
echo "  - Acesse: http://localhost:3000/api-docs"
npm run dev
