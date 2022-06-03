import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ALL_BOOKS, BOOK_ADDED } from '../queries';
import BooksTable from './BooksTable';

const Filter = ({ filters, setFilter }) => {
  return (
    <div>
      <button onClick={() => setFilter(null)}>clear</button>
      {filters.map((filter, idx) => (
        <button key={idx} onClick={() => setFilter(filter)}>
          {filter}
        </button>
      ))}
    </div>
  );
};
const Books = ({ show }) => {
  const [filter, setFilter] = useState(null);
  const [filters, setFilters] = useState([]);
  const { loading, data, subscribeToMore } = useQuery(ALL_BOOKS, {
    variables: { genre: filter }
  });
  useEffect(() => {
    /* Evitamos actualizar la lista de filtros cuando hay un filtro
    activo con el !filter */
    if (data && !filter) {
      const genres = data.allBooks.map((b) => b.genres).flat(1);
      const uniqueGenres = new Set(genres);
      setFilters([...uniqueGenres]);
    }
  }, [data, filter]);
  useEffect(() => {
    console.log('running subscribeToMore useEffect');
    subscribeToMore({
      document: BOOK_ADDED,
      // prev is currently cached result
      // the return value completely replaces the cached query
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        const { bookAdded } = subscriptionData.data;
        console.log('prev', prev);
        console.log('new book', bookAdded);
        if (prev.allBooks.find((b) => b.id === bookAdded.id)) return prev;
        return {
          allBooks: prev.allBooks.concat(bookAdded)
        };
      }
    });
  }, [subscribeToMore]);
  if (!show) return null;
  if (loading) return <div>loading...</div>;
  return (
    <div>
      <h2>Books</h2>
      {filter && <p>in genre {filter}</p>}
      <BooksTable books={data.allBooks} />
      <Filter setFilter={setFilter} filters={filters} />
    </div>
  );
};

export default Books;
