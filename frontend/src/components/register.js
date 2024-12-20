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
    if (!username.trim()) {
      errors.username = 'Имя пользователя обязательно.';
    }
    if (username.length <= 4) {
      errors.username = 'Имя пользователя слишком короткое.';
    }
    if (!password.trim() || password.length <= 4) {
      errors.password = 'Пароль обязателен.';
    }
    if (password.length <= 4) {
      errors.password = 'Пароль слишком короткий.';
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
      alert('Register successful!');
      navigate("/")
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="input-field"
          />
          {formErrors.username && <p className="error-message">{formErrors.username}</p>}
        </div>
        <div className="input-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          {formErrors.password && <p className="error-message">{formErrors.password}</p>}
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default Register;
