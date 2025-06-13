# BiblioTech

Sistema de gerenciamento de biblioteca com API RESTful.

## Requisitos

- Node.js (v14+)
- Docker (para PostgreSQL)

## Instalação e Configuração

### Método 1: Configuração Completa (Recomendado para primeira execução)

Execute o script de configuração que instalará todas as dependências e configurará o banco de dados:

```bash
cd back_end
chmod +x setup.sh
./setup.sh
```

Este script irá:
1. Criar um arquivo `.env` a partir do modelo `.env.example` (se não existir)
2. Instalar todas as dependências do projeto
3. Gerar o cliente Prisma
4. Verificar a conexão com o banco de dados PostgreSQL (via Docker)
5. Aplicar as migrações do banco de dados
6. Opcionalmente, popular o banco com dados iniciais

### Método 2: Inicialização Rápida (Para uso subsequente)

Se você já configurou o sistema anteriormente, pode usar o script de inicialização rápida:

```bash
cd back_end
chmod +x start-bibliotech.sh
./start-bibliotech.sh
```

Este script irá:
1. Verificar se o sistema já está configurado
2. Iniciar o container do PostgreSQL (se não estiver em execução)
3. Iniciar o servidor de desenvolvimento

## Uso da API

Após iniciar o servidor, acesse a documentação interativa da API em:
http://localhost:3000/api-docs

### Guia Rápido de Teste

1. Primeiro, crie um bibliotecário administrador (o primeiro usuário criado será sempre Admin)
2. Faça login para obter um token JWT
3. Use o token para autenticar as chamadas subsequentes
4. Explore as operações disponíveis na documentação Swagger

Para instruções detalhadas de teste, consulte o arquivo `back_end/testing-guide.txt`.

## Desenvolvimento

### Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento com auto-reload
- `npm run build` - Compila o código TypeScript
- `npm run start` - Inicia o servidor em modo de produção
- `npm run db:migrate` - Aplica as migrações do banco de dados
- `npm run db:seed` - Popula o banco de dados com dados iniciais
- `npm run db:reset` - Reseta o banco de dados (cuidado, apaga todos os dados)
- `npm run db:studio` - Abre o Prisma Studio para visualização do banco de dados

## Estrutura do Projeto

```
BiblioTech/
├── prisma/                 # Definições e migrações do banco de dados
│   ├── schema.prisma       # Modelo de dados do Prisma
│   └── migrations/         # Histórico de migrações do banco de dados
├── src/
│   ├── controllers/        # Controladores da aplicação
│   ├── middlewares/        # Middlewares do Express (auth, error handling)
│   ├── models/             # Definições de modelos e schemas do Swagger
│   ├── routes/             # Definição das rotas da API
│   └── index.ts            # Ponto de entrada da aplicação
├── .env                    # Variáveis de ambiente (não versionado)
├── .gitignore              # Arquivos ignorados pelo Git
├── package.json            # Dependências e scripts do projeto
├── tsconfig.json           # Configurações do TypeScript
├── ERD.svg                 # Diagrama ER gerado pelo prisma-erd-generator
└── README.md               # Esta documentação
```

## Testando a API

Você pode testar a API de várias maneiras:

### Usando o Swagger UI

A maneira mais fácil de testar a API é usando a interface Swagger disponível em `http://localhost:3000/api-docs`. Esta interface permite:

1. Visualizar todos os endpoints disponíveis
2. Testar chamadas diretamente do navegador
3. Ver os modelos de dados e exemplos de requisições/respostas

### Passo a passo para testar o fluxo básico

1. Criar um bibliotecário (primeiro será criado como Admin)
2. Autenticar com o bibliotecário para obter um token JWT
3. Autorizar o Swagger UI com o token
4. Criar categorias, editoras e autores
5. Cadastrar livros usando os nomes das entidades criadas
6. Testar as operações de consulta, atualização e remoção

### Usando clientes HTTP

Você também pode usar ferramentas como:

- **VS Code REST Client**: Arquivos `.http` estão disponíveis no diretório `http/`
- **Postman** ou **Insomnia**: Importando a coleção do Swagger (disponível para download na UI)
- **cURL**: Para chamadas via linha de comando

## Documentação da API

A documentação completa da API está disponível através do Swagger UI em `http://localhost:3000/api-docs`.

A documentação inclui:
- Todos os endpoints disponíveis
- Parâmetros necessários
- Formatos de requisição e resposta
- Códigos de status HTTP
- Exemplos de uso

## Permissões e Roles

O sistema usa três níveis de permissão para bibliotecários:

1. **Staff** - Acesso básico para operações diárias
2. **Manager** - Acesso intermediário, pode gerenciar categorias, autores e livros
3. **Admin** - Acesso completo ao sistema, incluindo gestão de bibliotecários

O primeiro bibliotecário cadastrado é automaticamente definido como Admin.

## Regras de Negócio

- ISBN de livros deve ser único no sistema
- O primeiro bibliotecário é criado sem autenticação e como Admin
- Nomes de autores, categorias e editoras são únicos
- Operações de exclusão verificam dependências antes de remover registros

## Em Desenvolvimento

Recursos que estão sendo desenvolvidos para as próximas versões:

- Gestão de exemplares físicos de livros (BookItems)
- Sistema de empréstimos e devoluções
- Reserva de livros
- Controle de multas por atraso
- Painel administrativo (front-end)
- Geração de relatórios
- Exportação de dados

## Autor

- **Lucas P. Souza** - [GitHub](https://github.com/Lucas-P-Souza)

## Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## Agradecimentos

- UNIFEI e aos professores da disciplina PBLC01
- Colegas que contribuíram com ideias e feedback
- Comunidades de Node.js, TypeScript e Prisma pelos recursos de aprendizado