/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identificador único da categoria (UUID)
 *         name:
 *           type: string
 *           description: Nome da categoria (único no sistema)
 *         description:
 *           type: string
 *           nullable: true
 *           description: Descrição detalhada da categoria
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da criação do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         name: "Ficção Científica"
 *         description: "Livros que exploram conceitos futuristas, científicos e tecnológicos."
 *         createdAt: "2023-01-15T14:30:00Z"
 *         updatedAt: "2023-01-15T14:30:00Z"
 * 
 *     NewCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da categoria (único no sistema)
 *         description:
 *           type: string
 *           nullable: true
 *           description: Descrição detalhada da categoria
 *       example:
 *         name: "Literatura Fantástica"
 *         description: "Livros que envolvem elementos mágicos ou sobrenaturais."
 * 
 *     UpdateCategory:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Novo nome para a categoria
 *         description:
 *           type: string
 *           nullable: true
 *           description: Nova descrição para a categoria
 *       example:
 *         name: "Literatura Fantástica & Mitológica"
 *         description: "Livros que envolvem elementos mágicos, sobrenaturais ou baseados em mitologia."
 * 
 *     Publisher:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identificador único da editora (UUID)
 *         name:
 *           type: string
 *           description: Nome da editora (único no sistema)
 *         location:
 *           type: string
 *           nullable: true
 *           description: Localização/endereço da editora
 *         website:
 *           type: string
 *           nullable: true
 *           description: Website oficial da editora
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da criação do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         name: "Companhia das Letras"
 *         location: "São Paulo, SP"
 *         website: "https://www.companhiadasletras.com.br"
 *         createdAt: "2023-01-15T14:30:00Z"
 *         updatedAt: "2023-01-15T14:30:00Z"
 * 
 *     NewPublisher:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nome da editora (único no sistema)
 *         location:
 *           type: string
 *           nullable: true
 *           description: Localização/endereço da editora
 *         website:
 *           type: string
 *           nullable: true
 *           description: Website oficial da editora
 *       example:
 *         name: "Editora Intrínseca"
 *         location: "Rio de Janeiro, RJ"
 *         website: "https://www.intrinseca.com.br"
 * 
 *     UpdatePublisher:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Novo nome para a editora
 *         location:
 *           type: string
 *           nullable: true
 *           description: Nova localização/endereço da editora
 *         website:
 *           type: string
 *           nullable: true
 *           description: Novo website da editora
 *       example:
 *         name: "Editora Intrínseca LTDA"
 *         location: "Rio de Janeiro, RJ - Brasil"
 *         website: "https://www.intrinseca.com.br"
 * 
 *     Author:
 *       type: object
 *       required:
 *         - id
 *         - name
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identificador único do autor (UUID)
 *         name:
 *           type: string
 *           description: Nome do autor (único no sistema)
 *         biography:
 *           type: string
 *           nullable: true
 *           description: Biografia do autor
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da criação do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440001"
 *         name: "Machado de Assis"
 *         biography: "Escritor brasileiro, considerado por muitos críticos o maior nome da literatura brasileira."
 *         createdAt: "2023-01-15T14:30:00Z"
 *         updatedAt: "2023-01-15T14:30:00Z"
 *
 *     NewAuthor:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Nome do autor (único no sistema)
 *         biography:
 *           type: string
 *           nullable: true
 *           description: Biografia do autor
 *       example:
 *         name: "José Saramago"
 *         biography: "Escritor português, vencedor do Prêmio Nobel de Literatura."
 *
 *     UpdateAuthor:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Novo nome do autor
 *         biography:
 *           type: string
 *           nullable: true
 *           description: Nova biografia do autor
 *       example:
 *         name: "José de Sousa Saramago"
 *         biography: "Escritor, argumentista, teatrólogo, ensaísta, jornalista, dramaturgo, contista, romancista e poeta português."
 *
 *     Book:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - isbn
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identificador único do livro (UUID)
 *         title:
 *           type: string
 *           description: Título do livro
 *         isbn:
 *           type: string
 *           description: ISBN (International Standard Book Number) do livro
 *         description:
 *           type: string
 *           nullable: true
 *           description: Descrição ou sinopse do livro
 *         publishYear:
 *           type: integer
 *           nullable: true
 *           description: Ano de publicação do livro
 *         coverImage:
 *           type: string
 *           nullable: true
 *           description: URL para a imagem da capa do livro
 *         available:
 *           type: boolean
 *           description: Indica se o livro está disponível para empréstimo
 *         authorId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID do autor do livro
 *         categoryId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID da categoria do livro
 *         publisherId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID da editora do livro
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da criação do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440000"
 *         title: "Dom Casmurro"
 *         isbn: "9788535902778"
 *         description: "Um clássico da literatura brasileira que explora temas como ciúme e traição."
 *         publishYear: 1899
 *         coverImage: "https://example.com/images/dom-casmurro.jpg"
 *         available: true
 *         authorId: "550e8400-e29b-41d4-a716-446655440001"
 *         categoryId: "550e8400-e29b-41d4-a716-446655440002"
 *         publisherId: "550e8400-e29b-41d4-a716-446655440003"
 *         createdAt: "2023-01-15T14:30:00Z"
 *         updatedAt: "2023-01-15T14:30:00Z"
 * 
 *     NewBook:
 *       type: object
 *       required:
 *         - title
 *         - isbn
 *         - publishYear
 *         - publisherName
 *         - authorNames
 *         - categoryNames
 *       properties:
 *         title:
 *           type: string
 *           description: Título do livro
 *         isbn:
 *           type: string
 *           description: ISBN do livro (deve ser único)
 *         description:
 *           type: string
 *           nullable: true
 *           description: Descrição ou sinopse do livro
 *         publishYear:
 *           type: integer
 *           description: Ano de publicação do livro
 *         coverImage:
 *           type: string
 *           nullable: true
 *           description: URL para a imagem da capa do livro
 *         publisherName:
 *           type: string
 *           description: Nome da editora (será criada se não existir)
 *         authorNames:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de nomes de autores (serão criados se não existirem)
 *         categoryNames:
 *           type: array
 *           items:
 *             type: string
 *           description: Lista de nomes de categorias (serão criadas se não existirem)
 *       example:
 *         title: "Grande Sertão: Veredas"
 *         isbn: "9788535902779"
 *         description: "Um dos maiores romances da literatura brasileira."
 *         publishYear: 1956
 *         coverImage: "https://example.com/images/grande-sertao-veredas.jpg"
 *         publisherName: "Companhia das Letras"
 *         authorNames: ["João Guimarães Rosa"]
 *         categoryNames: ["Literatura Brasileira", "Ficção Regionalista"]
 * 
 *     UpdateBook:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Novo título do livro
 *         isbn:
 *           type: string
 *           description: Novo ISBN do livro (deve ser único)
 *         description:
 *           type: string
 *           nullable: true
 *           description: Nova descrição ou sinopse do livro
 *         publishYear:
 *           type: integer
 *           nullable: true
 *           description: Novo ano de publicação do livro
 *         coverImage:
 *           type: string
 *           nullable: true
 *           description: Nova URL para a imagem da capa do livro
 *         available:
 *           type: boolean
 *           description: Novo status de disponibilidade do livro
 *         authorId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Novo ID do autor do livro
 *         categoryId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Novo ID da categoria do livro
 *         publisherId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Novo ID da editora do livro
 *       example:
 *         title: "Grande Sertão: Veredas (Edição Comemorativa)"
 *         description: "Edição especial comemorativa dos 60 anos do romance de Guimarães Rosa."
 *         publishYear: 2016
 *         available: true
 *
 *     Librarian:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - email
 *         - employeeId
 *         - role
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Identificador único do bibliotecário (UUID)
 *         name:
 *           type: string
 *           description: Nome completo do bibliotecário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do bibliotecário (único no sistema)
 *         employeeId:
 *           type: string
 *           description: Número de identificação do funcionário (único no sistema)
 *         role:
 *           type: string
 *           enum: [Admin, Manager, Staff]
 *           description: Nível de acesso do bibliotecário
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da criação do registro
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data e hora da última atualização
 *       example:
 *         id: "550e8400-e29b-41d4-a716-446655440005"
 *         name: "Maria Silva"
 *         email: "maria.silva@biblioteca.org"
 *         employeeId: "EMP12345"
 *         role: "Manager"
 *         createdAt: "2023-01-15T14:30:00Z"
 *         updatedAt: "2023-01-15T14:30:00Z"
 * 
 *     NewLibrarian:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - employeeId
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           description: Nome completo do bibliotecário
 *         email:
 *           type: string
 *           format: email
 *           description: Email do bibliotecário (deve ser único)
 *         employeeId:
 *           type: string
 *           description: Número de identificação do funcionário (deve ser único)
 *         password:
 *           type: string
 *           format: password
 *           description: Senha para acesso ao sistema
 *         role:
 *           type: string
 *           enum: [Admin, Manager, Staff]
 *           description: Nível de acesso do bibliotecário (default é 'Staff')
 *       example:
 *         name: "João Santos"
 *         email: "joao.santos@biblioteca.org"
 *         employeeId: "EMP12346"
 *         password: "SenhaSegura123!"
 *         role: "Staff"
 * 
 *     UpdateLibrarian:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Novo nome do bibliotecário
 *         email:
 *           type: string
 *           format: email
 *           description: Novo email do bibliotecário (deve ser único)
 *         employeeId:
 *           type: string
 *           description: Novo número de identificação do funcionário (deve ser único)
 *         password:
 *           type: string
 *           format: password
 *           description: Nova senha
 *         role:
 *           type: string
 *           enum: [Admin, Manager, Staff]
 *           description: Novo nível de acesso do bibliotecário
 *       example:
 *         name: "João Santos Silva"
 *         email: "joao.silva@biblioteca.org"
 *         role: "Manager"
 *
 *     DeleteAllResult:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem descritiva sobre o resultado da operação
 *         count:
 *           type: integer
 *           description: Número de registros afetados pela operação
 *       example:
 *         message: "Todos os registros foram removidos com sucesso."
 *         count: 15
 * 
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem de erro descritiva
 *       example:
 *         message: "Ocorreu um erro ao processar a solicitação."
 *
 *     LoginCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email do bibliotecário
 *         password:
 *           type: string
 *           format: password
 *           description: Senha do bibliotecário
 *       example:
 *         email: "admin@biblioteca.org"
 *         password: "senha123"
 *
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensagem informativa sobre o resultado do login
 *         token:
 *           type: string
 *           description: Token JWT para autenticação nas rotas protegidas
 *         librarian:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               description: ID do bibliotecário
 *             name:
 *               type: string
 *               description: Nome do bibliotecário
 *             email:
 *               type: string
 *               format: email
 *               description: Email do bibliotecário
 *             role:
 *               type: string
 *               enum: [Admin, Manager, Staff]
 *               description: Nível de acesso do bibliotecário
 *       example:
 *         message: "Login realizado com sucesso!"
 *         token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWJyYXJpYW5JZCI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6ImFkbWluQGJpYmxpb3RlY2Eub3JnIiwicm9sZSI6IkFkbWluIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJpYXQiOjE2MTY1MjM2MDAsImV4cCI6MTYxNjUyNzIwMH0.exampletoken"
 *         librarian:
 *           id: "1234567890"
 *           name: "Administrador"
 *           email: "admin@biblioteca.org"
 *           role: "Admin"
 */