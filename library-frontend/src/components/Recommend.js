import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ALL_BOOKS, USER } from '../queries';
import BooksTable from './BooksTable';

const Recommend = ({ show }) => {
  const [favouriteGenre, setFavouriteGenre] = useState(null);
  const books = useQuery(ALL_BOOKS, {
    variables: { genre: favouriteGenre }
  });
  const user = useQuery(USER);
  useEffect(() => {
    if (user.data && user.data.me) {
      setFavouriteGenre(user.data.me.favouriteGenre);
    }
  }, [user.data]);
  if (!show || !favouriteGenre) return null;
  return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <strong>{favouriteGenre}</strong>
      </p>
      <BooksTable books={books.data.allBooks} />
    </div>
  );
};
export default Recommend;
