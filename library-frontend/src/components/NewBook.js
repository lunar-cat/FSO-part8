import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { ADD_BOOK, ALL_BOOKS, ALL_AUTHORS, USER } from '../queries';

const NewBook = ({ show }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [published, setPublished] = useState('');
  const [genre, setGenre] = useState('');
  const [genres, setGenres] = useState([]);

  const [addBook] = useMutation(ADD_BOOK, {
    update: (cache, { data }) => {
      const { me } = cache.readQuery({ query: USER });
      const book = data.addBook;
      const author = data.addBook.author;

      const { allAuthors } = cache.readQuery({ query: ALL_AUTHORS });
      let updatedAuthors;
      // update
      if (allAuthors.map((a) => a.id).includes(author.id)) {
        updatedAuthors = allAuthors.map((a) =>
          a.id !== author.id ? a : author
        );
      } else {
        // new
        updatedAuthors = allAuthors.concat(author);
      }
      cache.writeQuery({
        query: ALL_AUTHORS,
        data: { allAuthors: updatedAuthors }
      });

      const withoutFilterQuery = {
        query: ALL_BOOKS,
        variables: { genre: null }
      };
      const withoutFilter = cache.readQuery(withoutFilterQuery);
      if (!withoutFilter.allBooks.some((b) => b.id === book.id)) {
        cache.writeQuery({
          ...withoutFilterQuery,
          data: { allBooks: withoutFilter.allBooks.concat(book) }
        });
      }

      if (book.genres.includes(me.favouriteGenre)) {
        const filteredQuery = {
          query: ALL_BOOKS,
          variables: { genre: me.favouriteGenre }
        };
        const filtered = cache.readQuery(filteredQuery);
        if (!filtered.allBooks.some((b) => b.id === book.id)) {
          cache.writeQuery({
            ...filteredQuery,
            data: { allBooks: filtered.allBooks.concat(book) }
          });
        }
      }
    },
    onError: (e) => console.error(e.graphQLErrors[0].message)
  });
  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    addBook({
      variables: { title, author, published: Number(published), genres }
    });
    setTitle('');
    setPublished('');
    setAuthor('');
    setGenres([]);
    setGenre('');
  };
  const addGenre = () => {
    setGenres(genres.concat(genre));
    setGenre('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  );
};
export default NewBook;
