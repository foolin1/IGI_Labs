import React, { useState, useEffect } from 'react';
import { getNews } from '../services/api';
import './styles/News.css';

export function News() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]); // Отфильтрованные новости
  const [searchQuery, setSearchQuery] = useState(''); // Строка поиска
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [searchQuery, news]); // Обновление фильтрации при изменении строки поиска или новостей

  const fetchNews = async () => {
    try {
      const data = await getNews();
      setNews(data || []);
    } catch (error) {
      console.error(error);
      setError('Ошибка при загрузке новостей');
    }
  };

  const filterNews = () => {
    const query = searchQuery.toLowerCase();
    const filtered = news.filter(
      (newsArticle) =>
        newsArticle.title.toLowerCase().includes(query) ||
        newsArticle.description.toLowerCase().includes(query) ||
        (newsArticle.date && newsArticle.date.toLowerCase().includes(query))
    );
    setFilteredNews(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="news-container">
      <h1>Новости</h1>

      {error && <p className="error-message">{error}</p>}

      {/* Поле для поиска */}
      <input
        type="text"
        className="news-search"
        placeholder="Поиск по названию, содержанию или дате"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      {/* Список новостей */}
      <ul className="news-list">
        {filteredNews.map((newsArticle) => (
          <li key={newsArticle._id} className="news-item">
            <strong>Название:</strong> {newsArticle.title}
            <p><strong>Содержание:</strong> {newsArticle.description}</p>
            <span>{newsArticle.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default News;
