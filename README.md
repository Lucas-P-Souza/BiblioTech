# BiblioTech - Sistema de Gerenciamento de Biblioteca

## Sobre o Projeto

BiblioTech é uma API RESTful desenvolvida como trabalho prático para a disciplina de Desenvolvimento de Projeto de Software (PBLC01) na UNIFEI. O sistema oferece uma solução completa para gerenciamento de bibliotecas, permitindo o controle de acervos, empréstimos, reservas e usuários de forma eficiente e integrada.

A API foi construída seguindo princípios REST e boas práticas de desenvolvimento, utilizando Node.js com TypeScript para criar uma base de código robusta e tipada, e PostgreSQL como banco de dados relacional.

## Funcionalidades

### Gerenciamento de Acervo

- **Livros**: Cadastro completo de livros com informações detalhadas, incluindo título, ISBN, ano de publicação e capa
- **Autores**: Registro de autores com biografia e associação a múltiplas obras
- **Categorias**: Organização de livros por categorias temáticas
- **Editoras**: Cadastro de editoras com informações de contato

### Gestão de Pessoas

- **Bibliotecários**: Controle de acesso com diferentes níveis de permissão (Admin, Manager, Staff)
- **Membros**: Cadastro de usuários da biblioteca (em desenvolvimento)

### Operações de Biblioteca

- **Empréstimos**: Registro e acompanhamento de empréstimos (em desenvolvimento)
- **Reservas**: Sistema de reserva de livros (em desenvolvimento)
- **Multas**: Controle de multas por atraso (em desenvolvimento)

### Segurança e Acessos

- **Autenticação**: Sistema JWT (JSON Web Tokens) para controle seguro de acesso
- **Autorização**: Controle granular de permissões baseado em papéis (roles)

## Tecnologias Utilizadas

### Back-end

- **Node.js** - Ambiente de execução JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web para criação da API REST
- **Prisma ORM** - ORM para interação com o banco de dados
- **JWT** - Autenticação e autorização com tokens
- **bcryptjs** - Hashing seguro de senhas
- **PostgreSQL** - Banco de dados relacional
- **Swagger/OpenAPI** - Documentação interativa da API

### DevOps

- **Docker** - Containerização do ambiente de desenvolvimento
- **Git & GitHub** - Controle de versão e colaboração

## Começando

Estas instruções vão ajudar você a obter uma cópia do projeto funcionando na sua máquina local para desenvolvimento e testes.

### Pré-requisitos

- Node.js (v14 ou superior)
- npm (v6 ou superior)
- Docker e Docker Compose
- Git

### Instalação

1. **Clone o repositório**

```bash
git clone https://github.com/Lucas-P-Souza/BiblioTech.git
cd BiblioTech
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```
DATABASE_URL="postgresql://adminbibliotech:SUA_SENHA_AQUI@localhost:5432/bibliotech_dev"
JWT_SECRET="sua_chave_secreta_para_tokens_jwt"
JWT_EXPIRES_IN="1d"
```

4. **Inicie o banco de dados PostgreSQL via Docker**

```bash
docker run --name bibliotech-db -e POSTGRES_USER=adminbibliotech -e POSTGRES_PASSWORD=SUA_SENHA_AQUI -e POSTGRES_DB=bibliotech_dev -p 5432:5432 -d postgres
```

5. **Execute as migrações do banco de dados**

```bash
npx prisma migrate dev
```

6. **Gere o Prisma Client**

```bash
npx prisma generate
```

7. **Inicie a aplicação em modo de desenvolvimento**

```bash
npm run dev
```

A API estará disponível em `http://localhost:3000` e a documentação Swagger em `http://localhost:3000/api-docs`.

## Diagrama de Entidade-Relacionamento (ERD)

O projeto inclui um diagrama ERD gerado automaticamente a partir do schema do Prisma. O diagrama ajuda a visualizar a estrutura do banco de dados e as relações entre as entidades.

Para gerar ou atualizar o diagrama ERD:

```bash
npx prisma generate
```

O diagrama será salvo como `ERD.svg` na raiz do projeto. Você pode visualizá-lo diretamente no navegador ou com qualquer visualizador de SVG.

![BiblioTech ERD](./ERD.svg)

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