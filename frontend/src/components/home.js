import '../App.css';
import { useEffect, useState } from 'react';
import { validate, fetchCatImage, fetchJoke } from '../services/api';

export const Home = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [catImage, setCatImage] = useState(null);
    const [joke, setJoke] = useState(null);

    useEffect(() => {
        async function fetchData() {
          setIsAuthenticated(await validate());
    
          const catImageUrl = await fetchCatImage();
          setCatImage(catImageUrl);
    
          const jokeData = await fetchJoke();
          setJoke(jokeData);
        }
    
        fetchData();
      }, []);

    
      const [userTimeZone, setUserTimeZone] = useState('');
      const [currentDate, setCurrentDate] = useState('');
      const [utcDate, setUtcDate] = useState('');
      const [lastModified, setLastModified] = useState('');
    
      useEffect(() => {
        // Получаем тайм-зону пользователя
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setUserTimeZone(timeZone);
    
        // Получаем текущую дату в тайм-зоне пользователя
        const localDate = new Date().toLocaleString("en-US", { timeZone });
        setCurrentDate(localDate);
    
        // Получаем текущую дату в UTC
        const utcFormatted = new Date().toLocaleString("en-US", { timeZone: "UTC" });
        setUtcDate(utcFormatted);
    
        // Симуляция даты изменения данных (например, получаем с сервера)
        const lastModifiedDate = new Date(new Date().getTime() - 3 * 60 * 60 * 1000).toLocaleString("en-US", { timeZone: "UTC" });
        setLastModified(lastModifiedDate);
      }, []);

      return(<>
      <div className="content">
          {catImage && <img src={catImage} alt="Random Cat" className="cat-image" />}
          {joke && (
            <div className="joke">
              <h3>Random Joke:</h3>
              {joke.type === 'single' ? <p>{joke.joke}</p> : <p>{joke.setup} - {joke.delivery}</p>}
            </div>
          )}
        </div>

        <div>
          <h1>Текущая информация</h1>
          <p>Текущая временная зона пользователя: {userTimeZone}</p>
          <p>Текущая дата (временная зона пользователя): {currentDate}</p>
          <p>Текущая дата (UTC): {utcDate}</p>
          <p>Дата изменения данных (UTC): {lastModified}</p>
        </div>
      </>);
}