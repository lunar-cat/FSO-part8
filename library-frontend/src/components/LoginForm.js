import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../queries';

const LoginForm = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [login, { data }] = useMutation(LOGIN, {
    onError: (error) => console.log(error.graphQLErrors[0].message)
  });

  useEffect(() => {
    if (data) {
      const token = data.login.value;
      setToken(token);
      setPage();
      localStorage.setItem('library-app-token', token);
    }
  }, [data]); // eslint-disable-line
  if (!show) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    login({ variables: { username, password } });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        name
        <input
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        password
        <input
          type="password"
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type="submit">login</button>
    </form>
  );
};
export default LoginForm;
