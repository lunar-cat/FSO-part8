require('dotenv').config();
const { ApolloServer, gql, UserInputError } = require('apollo-server');
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Author = require('./models/Author');

const MONGODB_URI = process.env.MONGODB_URI;
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch((e) => console.log('error connecting to MongoDB:', e.message));

const typeDefs = gql`
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => {
      return await Book.countDocuments();
    },
    authorCount: async () => {
      return await Author.countDocuments();
    },
    allBooks: async (root, args) => {
      const byAuthor = args.author;
      const byGenre = args.genre;
      if (byAuthor) {
        const author = await Author.findOne({ name: byAuthor });
        if (byGenre) {
          return await Book.find({
            author: author._id,
            genres: byGenre
          }).populate('author');
        }
        return await Book.find({ author: author._id }).populate('author');
      }
      if (byGenre) {
        return await Book.find({ genres: byGenre }).populate('author');
      }
      return await Book.find({}).populate('author');
    },
    allAuthors: async () => {
      return await Author.find({});
    }
  },
  Author: {
    bookCount: async (root) => {
      return await Book.countDocuments({ author: root.id }); // .id because apollo/graphql handles the ._id <-> .id conversion
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      const author = await Author.findOne({ name: args.author });
      let authorID;
      if (!author) {
        const newAuthor = new Author({ name: args.author });
        try {
          await newAuthor.save();
        } catch (error) {
          throw new UserInputError(error.message, { invalidArgs: args });
        }
        authorID = newAuthor._id;
      }
      const book = new Book({ ...args, author: authorID || author._id });
      try {
        await book.save();
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args });
      }
      return await book.populate('author');
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name });
      author.born = args.setBornTo;
      try {
        await author.save();
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args });
      }
      return author;
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
