const {
  UserInputError,
  AuthenticationError
} = require('apollo-server-express');
const Book = require('./models/Book');
const Author = require('./models/Author');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const { PubSub } = require('graphql-subscriptions');

const JWT_SECRET = process.env.JWT_SECRET;
const pubsub = new PubSub();
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
    },
    me: (root, args, { currentUser }) => {
      return currentUser;
    }
  },
  Author: {
    //eslint-disable-next-line
    bookCount: async (root) => {
      const author = root;
      return author.books.length;
    }
  },
  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError('not authenticated');
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author, books: [] });
        try {
          await author.save();
        } catch (error) {
          throw new UserInputError(error.message, { invalidArgs: args });
        }
      }
      const book = new Book({ ...args, author: author._id });
      try {
        await book.save();
        author.books = author.books.concat(book._id);
        await author.save();
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args });
      }
      await book.populate('author');
      pubsub.publish('BOOK_ADDED', { bookAdded: book });
      return book;
    },
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) throw new AuthenticationError('not authenticated');
      const author = await Author.findOne({ name: args.name });
      author.born = args.setBornTo;
      try {
        await author.save();
      } catch (error) {
        throw new UserInputError(error.message, { invalidArgs: args });
      }
      return author;
    },
    createUser: async (root, args) => {
      const { username, favouriteGenre } = args;
      const user = new User({ username, favouriteGenre });
      try {
        await user.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        });
      }
      return user;
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });
      if (!user || args.password !== 'secret') {
        throw new UserInputError('wrong credentials');
      }
      const userForToken = {
        username: user.username,
        id: user._id // why no .toString() ?
      };
      return { value: jwt.sign(userForToken, JWT_SECRET) };
    }
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
    }
  }
};

module.exports = resolvers;
