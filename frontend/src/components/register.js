import React, { useState } from 'react';
import { register } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './styles/Login.css';

export function Register({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const usernameRegex = /^[a-zA-Z0-9_]{5,20}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!username.trim()) {
      errors.username = 'Имя пользователя обязательно.';
    } else if (!usernameRegex.test(username)) {
      errors.username =
        'Имя пользователя должно содержать только буквы, цифры или подчеркивания, длина от 5 до 20 символов.';
    }

    if (!password.trim()) {
      errors.password = 'Пароль обязателен.';
    } else if (!passwordRegex.test(password)) {
      errors.password =
        'Пароль должен содержать минимум 8 символов, включая одну заглавную букву, одну строчную букву, одну цифру и один специальный символ.';
    }

    return errors;
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const result = await register(username, password);
      localStorage.setItem('jwt', result.token);
      setIsAuthenticated(true);
      alert('Регистрация прошла успешно!');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_DOMAIN}/auth/google`;
  };

  return (
    <div className="login-container">
      <h1>Регистрация</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <label htmlFor="username">Имя пользователя:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setFormErrors({ ...formErrors, username: '' });
            }}
            required
            className="input-field"
          />
          {formErrors.username && <p className="error-message">{formErrors.username}</p>}
        </div>
        <div className="input-group">
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setFormErrors({ ...formErrors, password: '' });
            }}
            required
            className="input-field"
          />
          {formErrors.password && <p className="error-message">{formErrors.password}</p>}
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
      <button onClick={handleGoogleRegister} className="google-register-btn">
        Зарегистрироваться через Google
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Register;
