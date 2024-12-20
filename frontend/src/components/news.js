import React, { Component } from 'react';
import { getNews } from '../services/api';
import './styles/News.css';

class News extends Component {
  constructor(props) {
    super(props);
    this.state = {
      news: [], // Список новостей
      filteredNews: [], // Отфильтрованные новости
      searchQuery: '', // Строка поиска
      error: null, // Ошибка загрузки новостей
    };
  }

  componentDidMount() {
    this.fetchNews();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.searchQuery !== this.state.searchQuery || prevState.news !== this.state.news) {
      this.filterNews();
    }
  }

  // Метод для загрузки новостей
  fetchNews = async () => {
    try {
      const data = await getNews();
      this.setState({ news: data || [] });
    } catch (error) {
      console.error(error);
      this.setState({ error: 'Ошибка при загрузке новостей' });
    }
  };

  // Метод для фильтрации новостей по строке поиска
  filterNews = () => {
    const { searchQuery, news } = this.state;
    const query = searchQuery.toLowerCase();
    const filtered = news.filter(
      (newsArticle) =>
        newsArticle.title.toLowerCase().includes(query) ||
        newsArticle.description.toLowerCase().includes(query) ||
        (newsArticle.date && newsArticle.date.toLowerCase().includes(query))
    );
    this.setState({ filteredNews: filtered });
  };

  // Метод для обновления строки поиска
  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  render() {
    const { filteredNews, searchQuery, error } = this.state;

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
          onChange={this.handleSearchChange}
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
}

export default News;
