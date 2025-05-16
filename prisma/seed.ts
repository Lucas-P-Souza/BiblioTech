import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // Create Categories
  const categories = [
    { name: 'Ficção', description: 'Livros de ficção em geral' },
    { name: 'Não-Ficção', description: 'Livros baseados em fatos e eventos reais' },
    { name: 'Romance', description: 'Histórias de amor e relacionamentos' },
    { name: 'Aventura', description: 'Livros sobre jornadas e descobertas' },
    { name: 'Tecnologia', description: 'Livros sobre computação e tecnologias em geral' }
  ];

  console.log('Creating categories...');
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  // Create Authors
  const authors = [
    { name: 'Autor 1', biography: 'Biografia do Autor 1' },
    { name: 'Autor 2', biography: 'Biografia do Autor 2' },
    { name: 'Autor 3', biography: 'Biografia do Autor 3' },
    { name: 'Autor 4', biography: 'Biografia do Autor 4' },
    { name: 'Autor 5', biography: 'Biografia do Autor 5' }
  ];

  console.log('Creating authors...');
  for (const author of authors) {
    await prisma.author.upsert({
      where: { name: author.name },
      update: {},
      create: author
    });
  }

  // Create Publishers
  const publishers = [
    { name: 'Editora 1', address: 'São Paulo, SP', contactInfo: 'contato@editora1.exemplo.com' },
    { name: 'Editora 2', address: 'Rio de Janeiro, RJ', contactInfo: 'contato@editora2.exemplo.com' },
    { name: 'Editora 3', address: 'Belo Horizonte, MG', contactInfo: 'contato@editora3.exemplo.com' }
  ];

  console.log('Creating publishers...');
  for (const publisher of publishers) {
    await prisma.publisher.upsert({
      where: { name: publisher.name },
      update: {},
      create: publisher
    });
  }

  // Create Books
  const books = [
    {
      title: 'Livro 1',
      isbn: '9781234567897',
      publicationYear: 2020,
      publisherName: 'Editora 1',
      authorNames: ['Autor 1', 'Autor 2'],
      categoryNames: ['Ficção', 'Aventura']
    },
    {
      title: 'Livro 2',
      isbn: '9781234567898',
      publicationYear: 2019,
      publisherName: 'Editora 2',
      authorNames: ['Autor 2'],
      categoryNames: ['Não-Ficção']
    },
    {
      title: 'Livro 3',
      isbn: '9781234567899',
      publicationYear: 2021,
      publisherName: 'Editora 3',
      authorNames: ['Autor 3', 'Autor 4'],
      categoryNames: ['Romance']
    },
    {
      title: 'Livro 4',
      isbn: '9781234567900',
      publicationYear: 2022,
      publisherName: 'Editora 1',
      authorNames: ['Autor 3'],
      categoryNames: ['Tecnologia']
    },
    {
      title: 'Livro 5',
      isbn: '9781234567901',
      publicationYear: 2018,
      publisherName: 'Editora 2',
      authorNames: ['Autor 5'],
      categoryNames: ['Ficção', 'Romance']
    }
  ];

  console.log('Creating books...');
  for (const book of books) {
    // First get or create the publisher
    const publisher = await prisma.publisher.findUnique({
      where: { name: book.publisherName }
    });

    if (!publisher) {
      console.error(`Publisher ${book.publisherName} not found`);
      continue;
    }

    // Create the book
    const createdBook = await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {},
      create: {
        title: book.title,
        isbn: book.isbn,
        publicationYear: book.publicationYear,
        publisher: { connect: { id: publisher.id } }
      }
    });

    // Connect authors
    for (const authorName of book.authorNames) {
      const author = await prisma.author.findUnique({
        where: { name: authorName }
      });
      
      if (author) {
        await prisma.book.update({
          where: { id: createdBook.id },
          data: {
            authors: {
              connect: { id: author.id }
            }
          }
        });
      }
    }

    // Connect categories
    for (const categoryName of book.categoryNames) {
      const category = await prisma.category.findUnique({
        where: { name: categoryName }
      });
      
      if (category) {
        await prisma.book.update({
          where: { id: createdBook.id },
          data: {
            categories: {
              connect: { id: category.id }
            }
          }
        });
      }
    }
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
