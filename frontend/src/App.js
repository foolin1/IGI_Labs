import './App.css';
import { useEffect, useState } from 'react';
import { validate, fetchCatImage, fetchJoke } from './services/api';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Autos } from './components/autos';
import { Login } from './components/login';
import { Register } from './components/register';
import News from './components/news';
import { ParkingSpots } from './components/parkingSpots';
import { Home } from './components/home';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      window.location.href = '/';  // Перенаправление на главную страницу
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      setIsAuthenticated(await validate());
    }

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt'); 
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div>
        <nav>
          <ul className="nav-list">
            {isAuthenticated ? (
              <>
                <li><Link to="/" className="nav-link">Домой</Link></li>
                <li><Link to="/my-autos" className="nav-link">Мои авто</Link></li>
                <li><Link to="/parking-spots" className="nav-link">Парк места</Link></li>
                <li><Link to="/news" className="nav-link">Новости</Link></li>
                <li><button onClick={handleLogout} className="nav-link logout-btn">Выйти</button></li>
              </>
            ) : (
              <>
                <li><Link to="/" className="nav-link">Домой</Link></li>
                <li><Link to="/parking-spots" className="nav-link">Парк места</Link></li>
                <li><Link to="/news" className="nav-link">Новости</Link></li>
                <li><Link to="/login" className="nav-link">Войти</Link></li>
                <li><Link to="/register" className="nav-link">Регистрация</Link></li>
              </>
            )}
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-autos" element={<Autos />} />
          <Route path="/parking-spots" element={<ParkingSpots />} />
          <Route path="/news" element={<News />} />
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
