import { useApolloClient } from '@apollo/client';
import { useState } from 'react';
import Authors from './components/Authors';
import Books from './components/Books';
import NewBook from './components/NewBook';
import LoginForm from './components/LoginForm';
import Recommend from './components/Recommend';

function App() {
  const [page, setPage] = useState('authors');
  const [token, setToken] = useState(null);
  const client = useApolloClient();
  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
    setPage('login');
  };
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>
      <Authors show={page === 'authors'} />
      <Books show={page === 'books'} />
      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        setPage={() => setPage('books')}
      />
      {token && (
        <>
          <NewBook show={page === 'add'} />
          <Recommend show={page === 'recommend'} />
        </>
      )}
    </div>
  );
}
/* La otra forma de hacer que Recommend cargue bien (cuando exista token)
sería pasarle la variable token, y agregar la opción de skip
con el useQuery, así skipea cuando no haya token !token */
export default App;
