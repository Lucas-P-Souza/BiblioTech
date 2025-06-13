#!/bin/bash

function show_help() {
    echo "Uso: ./bibliotech.sh [comando]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  setup         - Configura o ambiente completo (primeira execução)"
    echo "  start         - Inicia o servidor (sem configuração)"
    echo "  db:start      - Apenas inicia o banco de dados PostgreSQL"
    echo "  db:reset      - Limpa e reinicializa o banco de dados"
    echo "  help          - Mostra esta ajuda"
    echo ""
    echo "Exemplo: ./bibliotech.sh setup"
}

function check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "ERRO: Docker não está instalado. Instale o Docker primeiro."
        exit 1
    fi
}

function start_database() {
    check_docker
    echo "Iniciando PostgreSQL..."
    if docker ps --format '{{.Names}}' | grep -q '^bibliotech-postgres$'; then
        echo "✓ Container PostgreSQL 'bibliotech-postgres' já está em execução."
    elif docker ps -a --format '{{.Names}}' | grep -q '^bibliotech-postgres$'; then
        echo "- Iniciando container PostgreSQL existente 'bibliotech-postgres'..."
        # Tenta iniciar o container e verifica o status de saída
        if ! docker start bibliotech-postgres > /dev/null 2>&1; then
            echo "--------------------------------------------------------------------"
            echo "ERRO: Falha ao iniciar o container PostgreSQL 'bibliotech-postgres'."
            echo "Provável Causa: A porta 5432 já está em uso no seu sistema."
            echo ""
            echo "O que fazer:"
            echo "1. Verifique qual processo está usando a porta 5432:"
            echo "   sudo lsof -i :5432"
            echo "   ou"
            echo "   sudo netstat -tulnp | grep 5432"
            echo "2. Se for outro serviço PostgreSQL ou um processo diferente,"
            echo "   você precisa pará-lo para liberar a porta."
            echo "3. Se você deseja rodar o BiblioTech PostgreSQL em outra porta,"
            echo "   altere o mapeamento no comando 'docker run' dentro deste script"
            echo "   (ex: '-p 5433:5432') e atualize DATABASE_URL no arquivo .env."
            echo "--------------------------------------------------------------------"
            exit 1
        fi
        echo "✓ Container PostgreSQL 'bibliotech-postgres' iniciado."
    else
        echo "- Criando novo container PostgreSQL 'bibliotech-postgres'..."
        # Tenta criar e iniciar o container e verifica o status de saída
        if ! docker run --name bibliotech-postgres \
            -e POSTGRES_USER=bibliotech \
            -e POSTGRES_PASSWORD=bibliotech \
            -e POSTGRES_DB=bibliotech \
            -p 5432:5432 -d postgres:15 > /dev/null 2>&1; then
            echo "--------------------------------------------------------------------"
            echo "ERRO: Falha ao criar e iniciar o container PostgreSQL 'bibliotech-postgres'."
            echo "Provável Causa: A porta 5432 já está em uso no seu sistema."
            echo ""
            echo "O que fazer:"
            echo "1. Verifique qual processo está usando a porta 5432:"
            echo "   sudo lsof -i :5432"
            echo "   ou"
            echo "   sudo netstat -tulnp | grep 5432"
            echo "2. Se for outro serviço PostgreSQL ou um processo diferente,"
            echo "   você precisa pará-lo para liberar a porta."
            echo "3. Se você deseja rodar o BiblioTech PostgreSQL em outra porta,"
            echo "   altere o mapeamento neste comando (ex: '-p 5433:5432')"
            echo "   e atualize DATABASE_URL no arquivo .env."
            echo "--------------------------------------------------------------------"
            exit 1
        fi
        echo "✓ Novo container PostgreSQL 'bibliotech-postgres' criado e iniciado."
    fi
    echo "- Aguardando PostgreSQL inicializar completamente..."
    sleep 5 # Aumentado para dar mais tempo ao PostgreSQL
}

function setup_environment() {
    echo "Configurando ambiente..."
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "✓ Arquivo .env criado"
    fi

    echo "Instalando dependências..."
    npm install

    if ! grep -q "ts-node-dev" package.json; then
        npm install --save-dev ts-node-dev
    fi

    echo "Configurando Prisma..."
    npx prisma generate
}

function run_migrations() {
    echo "Executando migrações do banco de dados..."
    npx prisma migrate deploy
}

function seed_database() {
    echo "Deseja popular o banco de dados com dados iniciais? (S/n)"
    read -r response
    if [[ "$response" != "n" && "$response" != "N" ]]; then
        echo "Populando o banco de dados..."
        npx prisma db seed
    fi
}

function start_server() {
    echo "===== INICIANDO SERVIDOR BIBLIOTECH ====="
    echo "Acesse: http://localhost:3000/api-docs"
    npm run dev
}

# Menu principal baseado nos argumentos
case "$1" in
    setup)
        echo "===== CONFIGURAÇÃO COMPLETA DO BIBLIOTECH ====="
        start_database
        setup_environment
        run_migrations
        seed_database
        echo "✅ Configuração concluída! Execute './bibliotech.sh start' para iniciar o servidor."
        ;;
    start)
        start_database
        start_server
        ;;
    db:start)
        start_database
        echo "✅ Banco de dados iniciado."
        ;;
    db:reset)
        start_database
        echo "Resetando banco de dados..."
        npx prisma migrate reset --force
        echo "✅ Banco de dados resetado."
        ;;
    help|"")
        show_help
        ;;
    *)
        echo "Comando desconhecido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
