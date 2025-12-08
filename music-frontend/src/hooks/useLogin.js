import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [globalPassword, setGlobalPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password, globalPassword);
    if (!res.success) {
      setError(res.message);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    globalPassword,
    setGlobalPassword,
    error,
    handleSubmit
  };
};
