import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ALL_BOOKS } from '../queries';

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
      setFilters(data.allBooks.map((b) => b.genres).flat(1));
    }
  }, [data]);
  if (!show) return null;
  if (loading) return <div>loading...</div>;
  return (
    <div>
      <h2>Books</h2>
      {filter && <p>in genre {filter}</p>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.allBooks
            .filter((b) => (filter ? b.genres.includes(filter) : true))
            .map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.author.name}</td>
                <td>{b.published}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <Filter setFilter={setFilter} filters={filters} />
    </div>
  );
};

export default Books;
