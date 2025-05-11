# BiblioTech - API de Gerenciamento de Biblioteca

## Descrição do Projeto

BiblioTech é uma API RESTful desenvolvida como parte da disciplina PBLC01 - Desenvolvimento de Projeto de Software da Universidade Federal de Itajubá (UNIFEI). O objetivo deste projeto é criar um sistema de gerenciamento para uma biblioteca, permitindo o controle de livros, autores, categorias, editoras, usuários (membros), bibliotecários, empréstimos, multas e reservas.

Esta primeira fase do projeto (visando a Nota 1 / Entrega 5) foca no desenvolvimento do Back-End da API, incluindo a definição do modelo de dados, a lógica de negócios para as operações CRUD (Criar, Ler, Atualizar, Deletar) para as entidades principais, e a implementação de funcionalidades de autenticação (JWT) e documentação (Swagger).

## Funcionalidades Implementadas e Planejadas (Back-End - Entrega 5)

A API Back-End para a Entrega 5 (prevista para 14/05) tem como meta fornecer um conjunto completo de operações para o gerenciamento eficiente da biblioteca. O progresso atual e as funcionalidades chave incluem:

* **Endpoints CRUD (Criar, Ler, Atualizar, Deletar) implementados para as seguintes entidades centrais:**
  * **Autores (`/authors`):** Gestão completa, incluindo listagem com filtro por nome, busca por ID, criação, atualização (por ID e por nome), e deleção (individual por ID/nome e todos os autores).
  * **Categorias (`/categories`):** Gestão completa, incluindo listagem com filtro por nome, busca por ID, criação, atualização (por ID e por nome), e deleção (individual por ID/nome e todas as categorias).
  * **Editoras (`/publishers`):** Gestão completa, incluindo listagem com filtro por nome, busca por ID, criação, atualização (por ID e por nome), e deleção (individual por ID/nome e todas as editoras).
  * **Bibliotecários (`/librarians`):** Gestão completa com hashing seguro de senhas no cadastro e atualização, listagem, busca (por ID e `employeeId`), atualização (por ID e `employeeId`), e deleção (individual por ID/`employeeId` e todos os bibliotecários).
  * **Livros (`/books`):** Gestão completa com tratamento de relações para autores, categorias e editoras (permitindo conexão ou criação por nome/ISBN durante o cadastro/atualização do livro), listagem com filtros, busca (por ID e ISBN), atualização (por ID e ISBN), e deleção (individual por ID/ISBN e todos os livros).
* **Persistência de Dados:** Utilização do PostgreSQL como banco de dados, com o ORM Prisma gerenciando o mapeamento objeto-relacional e as migrações de schema.
* **Estrutura da API:** Servidor construído de forma modular com Express.js e TypeScript, seguindo boas práticas de organização de controllers e rotas.
* **Ambiente de Desenvolvimento:** Banco de dados PostgreSQL containerizado com Docker para facilitar a configuração e portabilidade do ambiente.

**Funcionalidades centrais a serem finalizadas para a Entrega 5:**

* Implementação completa dos endpoints CRUD para as entidades restantes do domínio: `User` (Membros da Biblioteca), `BookItem` (Exemplares Físicos dos Livros), `Loan` (Empréstimos), `Reservation` (Reservas), e `Fine` (Multas).
* Implementação de um sistema de autenticação e autorização robusto utilizando JSON Web Tokens (JWT) para proteger rotas e gerenciar permissões de acesso à API.
* Geração de documentação interativa e detalhada da API utilizando Swagger/OpenAPI.
* Validações de entrada consistentes e tratamento de erros aprimorado em todos os endpoints para garantir a robustez da API.

## Tecnologias Utilizadas (Back-End)

* **Node.js:** Ambiente de execução JavaScript (versão LTS recomendada).
* **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
* **Express.js:** Framework web para Node.js, utilizado para construir a API RESTful.
* **Prisma ORM:** ORM para interagir com o banco de dados PostgreSQL.
* **PostgreSQL:** Sistema de gerenciamento de banco de dados relacional objeto.
* **Docker & Docker Desktop:** Para containerizar e executar o banco de dados PostgreSQL.
* **bcryptjs:** Para hashing seguro de senhas.
* **Nodemon:** Para reiniciar automaticamente o servidor durante o desenvolvimento.
* **ts-node:** Para executar diretamente os arquivos TypeScript no Node.js.
* **Git & GitHub:** Para controle de versão e hospedagem do código.

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

* [Node.js](https://nodejs.org/) (versão LTS instalada)
* [npm](https://www.npmjs.com/) (instalado com o Node.js)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando.
* [Git](https://git-scm.com/)

### Passos para Rodar Localmente

1. **Clone o Repositório:**

    ```bash
    git clone [https://github.com/Lucas-P-Souza/BiblioTech.git](https://github.com/Lucas-P-Souza/BiblioTech.git)
    cd BiblioTech
    ```

2. **Instale as Dependências do Projeto:**
    Execute na raiz do projeto:

    ```bash
    npm install
    ```

3. **Configure as Variáveis de Ambiente:**
    * Crie um arquivo chamado `.env` na raiz do projeto.
    * Adicione a string de conexão com o PostgreSQL. O formato é:

        ```env
        DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
        ```

    * **Para o contêiner Docker padrão configurado para este projeto, use:**
        * `USER`: `adminbibliotech`
        * `PASSWORD`: (A senha definida ao iniciar o contêiner Docker - veja passo 4)
        * `HOST`: `localhost`
        * `PORT`: `5432`
        * `DATABASE_NAME`: `bibliotech_dev`
    * Exemplo de preenchimento no `.env` (substitua `SUA_SENHA_DEFINIDA_NO_DOCKER`):

        ```env
        DATABASE_URL="postgresql://adminbibliotech:SUA_SENHA_DEFINIDA_NO_DOCKER@localhost:5432/bibliotech_dev"
        ```

4. **Inicie o Contêiner Docker do PostgreSQL (se ainda não estiver rodando):**
    No terminal, execute o comando abaixo. Substitua `SUA_SENHA_FORTE_AQUI` por uma senha de sua escolha para o banco de dados (esta será a senha a ser usada no `.env`):

    ```bash
    docker run --name bibliotech-db -e POSTGRES_USER=adminbibliotech -e POSTGRES_PASSWORD=SUA_SENHA_FORTE_AQUI -e POSTGRES_DB=bibliotech_dev -p 5432:5432 -d postgres
    ```

    * Para verificar se o contêiner está rodando: `docker ps`.

5. **Aplique as Migrações do Prisma:**
    Este comando criará as tabelas no banco de dados PostgreSQL com base no `schema.prisma`.

    ```bash
    npx prisma migrate dev
    ```

    (Confirme `y` se for solicitado).

6. **Gere o Prisma Client:**

    ```bash
    npx prisma generate
    ```

7. **Inicie o Servidor de Desenvolvimento:**

    ```bash
    npm run dev
    ```

    O servidor deverá iniciar na porta 3000 (ou a definida em `process.env.PORT`).

## Testando a API

* A API é testada enviando requisições HTTP para os seus endpoints.
* Recomenda-se o uso da extensão **REST Client** para VS Code.
* Arquivos de exemplo para o REST Client (formato `.http`) estão localizados na pasta `/http` do projeto.
* Esses arquivos contêm exemplos de requisições para os diversos endpoints CRUD das entidades da API.

## Estrutura do Projeto (Principais Pastas)

* `BIBLIOTECH/`
  * `.env`                   *(Variáveis de ambiente - NÃO versionado)*
  * `.git/`                  *(Pasta do Git - oculta)*
  * `.gitignore`             *(Arquivos e pastas ignorados pelo Git)*
  * `README.md`              *(Esta documentação)*
  * `package-lock.json`
  * `package.json`           *(Metadados, dependências e scripts do projeto)*
  * `tsconfig.json`          *(Configurações do TypeScript)*
  * `http/`                  *(Arquivos .http para teste com REST Client)*
    * `authors.http`
    * `books_by_isbn_test.http`
    * `categories.http`
    * `librarians.http`
    * `publishers.http`
    * `(outros_arquivos_de_teste.http)`
  * `prisma/`                *(Configurações, schema e migrações do Prisma)*
    * `schema.prisma`
    * `migrations/`
      * `... (pastas de cada migração)`
  * `src/`                   *(Código-fonte da aplicação TypeScript)*
    * `controllers/`         *(Lógica de manipulação de requisições para cada rota)*
      * `author.controller.ts`
      * `book.controller.ts`
      * `category.controller.ts`
      * `librarian.controller.ts`
      * `publisher.controller.ts`
      * `(outros_controllers.ts)`
    * `domain/`              *(Definições das entidades e enums do núcleo do sistema)*
      * `entities/`
        * `Author.ts`
        * `Book.ts`
        * `BookItem.ts`
        * `Category.ts`
        * `Fine.ts`
        * `Librarian.ts`
        * `Loan.ts`
        * `Publisher.ts`
        * `Reservation.ts`
        * `User.ts`
      * `enums/`
        * `BookItemStatus.ts`
        * `FineStatus.ts`
        * `LibrarianRole.ts`
        * `LoanStatus.ts`
        * `ReservationStatus.ts`
    * `routes/`              *(Definição das rotas (endpoints) da API)*
      * `author.routes.ts`
      * `book.routes.ts`
      * `category.routes.ts`
      * `librarian.routes.ts`
      * `publisher.routes.ts`
      * `(outras_rotas.ts)`
    * `index.ts`             *(Ponto de entrada e configuração do servidor Express)*

## Autoria

* **Lucas P. Souza** - Repositório: [BiblioTech no GitHub](https://github.com/Lucas-P-Souza/BiblioTech.git)

## Informações do Curso

* **Disciplina:** PBLC01 - Desenvolvimento de Projeto de Software
* **Instituição:** UNIFEI - Universidade Federal de Itajubá
* **Professores:** Profa. Dra. Bárbara Pimenta Caetano, Prof. Dr. Enzo Seraphim

## Nota sobre a Utilização de IA

Durante o desenvolvimento deste projeto, a inteligência artificial **Gemini 2.5 Pro (Google)** foi consultada como uma ferramenta de auxílio. Sua contribuição incluiu assistência na formulação e revisão de comentários no código para melhorar a clareza, além de suporte na depuração de erros e na elaboração de explicações conceituais.