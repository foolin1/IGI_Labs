import React, { useState, useEffect } from 'react';
import { getParkingSpots } from '../services/api';
import './styles/ParkingSpots.css';

export function ParkingSpots() {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]); // Для фильтрованных парковочных мест
  const [searchQuery, setSearchQuery] = useState(''); // Строка поиска
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  useEffect(() => {
    filterParkingSpots();
  }, [searchQuery, parkingSpots]); // Фильтрация при изменении строки поиска или данных

  const fetchParkingSpots = async () => {
    try {
      const data = await getParkingSpots();
      setParkingSpots(data || []);
    } catch (error) {
      console.error(error);
      setError('Ошибка при загрузке данных о парковочных местах');
    }
  };

  const filterParkingSpots = () => {
    const query = searchQuery.toLowerCase();
    const filtered = parkingSpots.filter(
      (spot) =>
        spot.number.toLowerCase().includes(query) ||
        (spot.Boolean ? 'да' : 'нет').includes(query) || // Проверка статуса занятости
        String(spot.price).includes(query) // Поиск по цене
    );
    setFilteredSpots(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="parking-spots-container">
      <h1>Парковочные места</h1>

      {error && <p className="error-message">{error}</p>}

      {/* Поле для поиска */}
      <input
        type="text"
        className="parking-search"
        placeholder="Поиск по номеру, занятости или цене"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      <ul className="parking-spots-list">
        {filteredSpots.map((parkingSpot) => (
          <li key={parkingSpot._id} className="parking-spot">
            <div>
              <strong>Номер:</strong> {parkingSpot.number}, 
              <strong>Занято?:</strong> 
              <span className={parkingSpot.Boolean ? 'parking-spot-occupied' : 'parking-spot-free'}>
                {parkingSpot.Boolean ? 'Да' : 'Нет'}
              </span>, 
              <strong>Цена:</strong> 
              <span className="parking-spot-price">{parkingSpot.price}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ParkingSpots;