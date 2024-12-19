import './App.css';
import { useEffect, useState } from 'react';
import { validate } from './services/api';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { Autos } from './components/autos';
import { Login } from './components/login';
import { Register } from './components/register';
import { News } from './components/news';
import { ParkingSpots } from './components/parkingSpots';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
                <li><Link to="/my-autos" className="nav-link">Мои авто</Link></li>
                <li><Link to="/parking-spots" className="nav-link">Парк места</Link></li>
                <li><Link to="/news" className="nav-link">Новости</Link></li>
                <li><button onClick={handleLogout} className="nav-link logout-btn">Выйти</button></li>
              </>
            ) : (
              <>
                <li><Link to="/parking-spots" className="nav-link">Парк места</Link></li>
                <li><Link to="/news" className="nav-link">Новости</Link></li>
                <li><Link to="/login" className="nav-link">Войти</Link></li>
                <li><Link to="/register" className="nav-link">Регистрация</Link></li>
              </>
            )}
          </ul>
        </nav>
            
        <Routes>
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
