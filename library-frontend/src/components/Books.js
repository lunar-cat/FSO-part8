import { useQuery } from '@apollo/client';
import { ALL_BOOKS } from '../queries';

const Books = ({ show }) => {
  const { loading, data } = useQuery(ALL_BOOKS);
  if (!show) return null;
  if (loading) return <div>loading...</div>;
  return (
    <div>
      <h2>Books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.allBooks.map((b) => (
            <tr key={b.id}>
              <td>{b.title}</td>
              <td>{b.author}</td>
              <td>{b.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
