import React, { useState, useEffect } from 'react';
import { getParkingSpots } from '../services/api';
import './styles/ParkingSpots.css';

export function ParkingSpots() {
  const [parkingSpots, setParkingSpots] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  const fetchParkingSpots = async () => {
    try {
      const data = await getParkingSpots();
      setParkingSpots(data || []);
    } catch (error) {
      console.error(error);
      setError('Ошибка при загрузке данных о парковочных местах');
    }
  };

  return (
    <div className="parking-spots-container">
      <h1>Парковочные места</h1>

      {error && <p className="error-message">{error}</p>}

      <ul className="parking-spots-list">
        {parkingSpots.map((parkingSpot) => (
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
