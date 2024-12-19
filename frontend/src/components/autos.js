import React, { useState, useEffect } from 'react';
import { getAutos, addAuto, updateAuto, deleteAuto } from '../services/api';
import { validate } from '../services/api';
import './styles/Autos.css';

export function Autos() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    async function fetchData() {
      setIsAuthenticated(await validate());
    }

    fetchData();
  }, []);
  
  const [autos, setAutos] = useState([]);
  const [formData, setFormData] = useState({
    number: '',
    model: '',
    bodyType: '',
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAutos();
  }, []);

  const fetchAutos = async () => {
    try {
      const data = await getAutos();
      setAutos(data || []);
    } catch (error) {
      console.error(error);
      setError('Ошибка при загрузке автомобилей');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateAuto(editId, formData);
      } else {
        await addAuto(formData);
      }
      fetchAutos();
      setFormData({ number: '', model: '', bodyType: '' });
      setEditId(null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Ошибка при сохранении автомобиля');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAuto(id);
      fetchAutos();
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Ошибка при удалении автомобиля');
    }
  };

  const handleEdit = (auto) => {
    setEditId(auto._id);
    setFormData({
      number: auto.number,
      model: auto.model,
      bodyType: auto.bodyType,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="autos-container">
        {error && <p className="error-message">Вы не авторизованы!</p>}
      </div>
    );
  }

  return (
    <div className="autos-container">
      <h1>Мои авто</h1>

      {error && <p className="error-message">{error}</p>}

      <ul className="autos-list">
        {autos.map((auto) => (
          <li key={auto._id} className="autos-item">
            <div>
              <strong>Номер:</strong> {auto.number}, <strong>Модель:</strong> {auto.model}, <strong>Тип кузова:</strong> {auto.bodyType}
            </div>
            <div>
              <button onClick={() => handleEdit(auto)}>Изменить</button>
              <button onClick={() => handleDelete(auto._id)}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>

      <form className="autos-form" onSubmit={handleSubmit}>
        <h2>{editId ? 'Изменить авто' : 'Добавить авто'}</h2>
        <input
          type="text"
          name="number"
          value={formData.number}
          onChange={handleInputChange}
          placeholder="Номер"
          required
        />
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleInputChange}
          placeholder="Модель"
          required
        />
        <input
          type="text"
          name="bodyType"
          value={formData.bodyType}
          onChange={handleInputChange}
          placeholder="Тип кузова"
          required
        />
        <button type="submit">{editId ? 'Сохранить' : 'Добавить'}</button>
      </form>
    </div>
  );
}

export default Autos;
