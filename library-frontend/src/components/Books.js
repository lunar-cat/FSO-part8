import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ALL_BOOKS } from '../queries';
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
  const { loading, data } = useQuery(ALL_BOOKS);
  useEffect(() => {
    if (data) {
      const genres = data.allBooks.map((b) => b.genres).flat(1);
      const uniqueGenres = new Set(genres);
      setFilters([...uniqueGenres]);
    }
  }, [data]);
  if (!show) return null;
  if (loading) return <div>loading...</div>;
  return (
    <div>
      <h2>Books</h2>
      {filter && <p>in genre {filter}</p>}
      <BooksTable
        books={data.allBooks.filter((b) =>
          filter ? b.genres.includes(filter) : true
        )}
      />
      <Filter setFilter={setFilter} filters={filters} />
    </div>
  );
};

export default Books;
