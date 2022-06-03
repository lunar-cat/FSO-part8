import { useMutation, useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries';

const Authors = ({ show }) => {
  const { loading, data } = useQuery(ALL_AUTHORS);
  if (!show) return null;
  if (loading) return <div>loading...</div>;
  return (
    <div>
      <h2>Authors</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {data.allAuthors.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.allAuthors.length > 0 && <BirthForm authors={data.allAuthors} />}
    </div>
  );
};

const BirthForm = ({ authors }) => {
  const [name, setName] = useState(authors[0].name);
  const [born, setBorn] = useState('');
  const [editAuthor, { data }] = useMutation(EDIT_AUTHOR);
  useEffect(() => {
    if (data && data.editAuthor === null) {
      console.log('error', data);
    }
  }, [data]);
  const handleSubmit = (e) => {
    e.preventDefault();
    editAuthor({ variables: { name, born: Number(born) } });
    setName(authors[0].name);
    setBorn('');
  };
  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <select value={name} onChange={({ target }) => setName(target.value)}>
            {authors.map((a) => (
              <option key={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  );
};
export default Authors;
