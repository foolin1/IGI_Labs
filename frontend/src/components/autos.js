import React, { useState, useEffect } from 'react';
import { getAutos, addAuto, updateAuto, deleteAuto } from '../services/api';
import { validate } from '../services/api';
import './styles/Autos.css';

export function Autos() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [autos, setAutos] = useState([]);
  const [filteredAutos, setFilteredAutos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    number: '',
    model: '',
    bodyType: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setIsAuthenticated(await validate());
    }

    fetchData();
  }, []);

  useEffect(() => {
    fetchAutos();
  }, []);

  useEffect(() => {
    filterAutos();
  }, [searchQuery, autos]);

  const fetchAutos = async () => {
    try {
      const data = await getAutos();
      setAutos(data || []);
    } catch (error) {
      console.error(error);
      setError('Ошибка при загрузке автомобилей');
    }
  };

  const filterAutos = () => {
    const query = searchQuery.toLowerCase();
    const filtered = autos.filter(
      (auto) =>
        auto.number.toLowerCase().includes(query) ||
        auto.model.toLowerCase().includes(query) ||
        auto.bodyType.toLowerCase().includes(query)
    );
    setFilteredAutos(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: '' }); // Убираем ошибку при изменении
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.number.trim()) {
      errors.number = 'Номер обязателен.';
    }
    if (!formData.model.trim()) {
      errors.model = 'Модель обязательна.';
    }
    if (!formData.bodyType.trim()) {
      errors.bodyType = 'Тип кузова обязателен.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

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
      setFormErrors({});
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

      {/* Поле для поиска */}
      <input
        type="text"
        className="autos-search"
        placeholder="Поиск по номеру, модели или типу кузова"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      {/* Список автомобилей */}
      <ul className="autos-list">
        {filteredAutos.map((auto) => (
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

      {/* Форма добавления/редактирования автомобиля */}
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
        {formErrors.number && <p className="error-message">{formErrors.number}</p>}
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleInputChange}
          placeholder="Модель"
          required
        />
        {formErrors.model && <p className="error-message">{formErrors.model}</p>}
        <input
          type="text"
          name="bodyType"
          value={formData.bodyType}
          onChange={handleInputChange}
          placeholder="Тип кузова"
          required
        />
        {formErrors.bodyType && <p className="error-message">{formErrors.bodyType}</p>}
        <button type="submit">{editId ? 'Сохранить' : 'Добавить'}</button>
      </form>
    </div>
  );
}

export default Autos;
