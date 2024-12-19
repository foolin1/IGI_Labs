import React, { useState, useEffect } from 'react';
import { getNews } from '../services/api';
import './styles/News.css';

export function News() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const data = await getNews();
      setNews(data || []);
    } catch (error) {
      console.error(error);
      setError('Ошибка при загрузке новостей');
    }
  };

  return (
    <div className="news-container">
      <h1>Новости</h1>

      {error && <p className="error-message">{error}</p>}

      <ul className="news-list">
        {news.map((newsArticle) => (
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
